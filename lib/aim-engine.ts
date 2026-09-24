import * as THREE from 'three';

export type AimPhase = 'idle' | 'countdown' | 'running' | 'done';
export type AimDetails = {
  duration: number;
  hits: number;
  shots: number;
  accuracy: number;
  averageHitMs: number;
  sensitivity: number;
  mode: 'cursor' | 'mouse-look';
  acquisitionTimes: number[];
};
export type AimSnapshot = {
  phase: AimPhase;
  remaining: number;
  countdown: number;
  hits: number;
  shots: number;
  accuracy: number;
  go: boolean;
};
type Hooks = {
  tick: (state: AimSnapshot) => void;
  finish: (result: AimDetails) => void;
  target: (x: number, y: number, diameter: number, visible: boolean) => void;
  contextLost: () => void;
};

export class AimEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly canvas: HTMLCanvasElement;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(70, 1, 0.05, 130);
  private targetGroup = new THREE.Group();
  private targetFace: THREE.Mesh;
  private weapon = new THREE.Group();
  private muzzle: THREE.Mesh;
  private ray = new THREE.Raycaster();
  private observer: ResizeObserver;
  private frame = 0;
  private disposed = false;
  private phase: AimPhase = 'idle';
  private startsAt = 0;
  private duration = 30;
  private hits = 0;
  private shots = 0;
  private sensitivity = 1;
  private mode: AimDetails['mode'] = 'cursor';
  private acquiredAt = 0;
  private acquisitionTimes: number[] = [];
  private shotAt = -1000;
  private lastTick = 0;
  private yaw = 0;
  private pitch = 0;
  private width = 1;
  private height = 1;
  private reduceMotion: boolean;
  private contextListener: (event: Event) => void;

  constructor(
    private container: HTMLElement,
    private hooks: Hooks,
    reducedMotion = false,
  ) {
    this.reduceMotion = reducedMotion;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor('#111019');
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute('aria-label', 'Interactive first-person target range');
    this.canvas.setAttribute('role', 'img');
    container.appendChild(this.canvas);
    this.scene.fog = new THREE.Fog('#14131e', 28, 70);
    this.camera.position.set(0, 2.5, 10);
    this.scene.add(this.camera);
    this.scene.add(new THREE.HemisphereLight('#c1bddb', '#251928', 2.3));
    const key = new THREE.DirectionalLight('#d9dcff', 3);
    key.position.set(8, 15, 6);
    this.scene.add(key);
    const fill = new THREE.PointLight('#9675ff', 80, 38);
    fill.position.set(-7, 6, -10);
    this.scene.add(fill);
    const metal = new THREE.MeshStandardMaterial({
      color: '#242535',
      roughness: 0.72,
      metalness: 0.45,
    });
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 100),
      new THREE.MeshStandardMaterial({ color: '#1d1e2a', roughness: 0.8, metalness: 0.25 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -22;
    this.scene.add(floor);
    const grid = new THREE.GridHelper(60, 30, '#574963', '#30303f');
    grid.position.set(0, 0.006, -18);
    this.scene.add(grid);
    this.box(46, 14, 0.5, 0, 7, -35, metal);
    this.box(0.5, 14, 60, -23, 7, -12, metal);
    this.box(0.5, 14, 60, 23, 7, -12, metal);
    const lightStrip = new THREE.MeshBasicMaterial({ color: '#a291f2' });
    const paleStrip = new THREE.MeshBasicMaterial({ color: '#76bbb3' });
    for (const x of [-18, -12, -6, 0, 6, 12, 18]) {
      this.box(0.18, 9, 0.7, x, 5.5, -34.6, lightStrip);
      this.box(3.6, 0.09, 0.8, x, 1.2, -34.5, paleStrip);
    }
    for (const z of [-25, -15, -5, 5]) {
      this.box(0.45, 10, 0.65, -16, 5, z, metal);
      this.box(0.45, 10, 0.65, 16, 5, z, metal);
      this.box(32, 0.14, 0.2, 0, 10, z, lightStrip);
    }
    const plateMaterial = new THREE.MeshStandardMaterial({
      color: '#eb779b',
      emissive: '#a82360',
      emissiveIntensity: 0.48,
      metalness: 0.4,
      roughness: 0.4,
    });
    this.targetFace = new THREE.Mesh(new THREE.CircleGeometry(0.88, 48), plateMaterial);
    this.targetGroup.add(this.targetFace);
    const bullseye = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32),
      new THREE.MeshBasicMaterial({ color: '#fff0f6' }),
    );
    bullseye.position.z = 0.014;
    this.targetGroup.add(bullseye);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.69, 48),
      new THREE.MeshBasicMaterial({ color: '#ffc5dd' }),
    );
    ring.position.z = 0.016;
    this.targetGroup.add(ring);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.91, 0.035, 8, 48),
      new THREE.MeshBasicMaterial({ color: '#f28db6' }),
    );
    this.targetGroup.add(rim);
    this.targetGroup.position.set(0, 2.5, -12);
    this.targetGroup.visible = false;
    this.scene.add(this.targetGroup);
    const gunMetal = new THREE.MeshStandardMaterial({
      color: '#343545',
      metalness: 0.75,
      roughness: 0.28,
    });
    const gunAccent = new THREE.MeshStandardMaterial({
      color: '#947aba',
      metalness: 0.55,
      roughness: 0.35,
    });
    const sleeve = new THREE.MeshStandardMaterial({ color: '#292636', roughness: 0.95 });
    const glove = new THREE.MeshStandardMaterial({ color: '#171821', roughness: 0.8 });
    this.box(0.18, 0.18, 0.68, 0, 0, 0, gunMetal, this.weapon);
    this.box(0.19, 0.11, 0.5, 0, 0.12, -0.08, gunAccent, this.weapon);
    this.box(0.11, 0.045, 0.08, 0, 0.2, -0.25, gunMetal, this.weapon);
    this.box(0.06, 0.026, 0.03, 0, 0.23, -0.26, paleStrip, this.weapon);
    const grip = this.box(0.14, 0.31, 0.16, 0, -0.2, 0.16, gunMetal, this.weapon);
    grip.rotation.x = -0.24;
    this.box(0.22, 0.16, 0.2, 0, -0.2, 0.18, glove, this.weapon);
    const arm = this.box(0.23, 0.23, 0.7, 0.025, -0.37, 0.51, sleeve, this.weapon);
    arm.rotation.x = -0.45;
    this.box(0.05, 0.035, 0.45, 0.096, 0.06, -0.035, lightStrip, this.weapon);
    this.muzzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.26, 7),
      new THREE.MeshBasicMaterial({ color: '#ffe6a0', transparent: true, opacity: 0.8 }),
    );
    this.muzzle.rotation.x = -Math.PI / 2;
    this.muzzle.position.z = -0.48;
    this.muzzle.visible = false;
    this.weapon.add(this.muzzle);
    this.weapon.position.set(0.4, -0.39, -0.8);
    this.weapon.rotation.y = -0.06;
    this.camera.add(this.weapon);
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);
    this.contextListener = (event) => {
      event.preventDefault();
      this.cancel();
      this.hooks.contextLost();
    };
    this.canvas.addEventListener('webglcontextlost', this.contextListener);
    this.frame = requestAnimationFrame(this.draw);
  }
  private box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    parent: THREE.Object3D = this.scene,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  private resize() {
    this.width = Math.max(1, this.container.clientWidth);
    this.height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }
  start(duration: number, sensitivity: number, mode: AimDetails['mode']) {
    this.duration = duration;
    this.sensitivity = sensitivity;
    this.mode = mode;
    this.hits = 0;
    this.shots = 0;
    this.acquisitionTimes = [];
    this.yaw = 0;
    this.pitch = 0;
    this.camera.rotation.set(0, 0, 0);
    this.targetGroup.position.set(0, 2.5, -12);
    this.targetGroup.quaternion.identity();
    this.targetGroup.visible = false;
    this.phase = 'countdown';
    this.startsAt = performance.now() + 3000;
    this.lastTick = 0;
    this.emit(performance.now());
  }
  look(x: number, y: number) {
    if (this.mode !== 'mouse-look' || !['countdown', 'running'].includes(this.phase)) return;
    this.yaw = THREE.MathUtils.clamp(this.yaw - x * 0.002 * this.sensitivity, -0.8, 0.8);
    this.pitch = THREE.MathUtils.clamp(this.pitch - y * 0.002 * this.sensitivity, -0.35, 0.4);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
  shoot(clientX: number, clientY: number) {
    const now = performance.now();
    if (this.phase !== 'running') return;
    if (now >= this.startsAt + this.duration * 1000) {
      this.finish();
      return;
    }
    this.shots++;
    this.shotAt = now;
    const rect = this.canvas.getBoundingClientRect();
    const point =
      this.mode === 'mouse-look'
        ? new THREE.Vector2(0, 0)
        : new THREE.Vector2(
            ((clientX - rect.left) / rect.width) * 2 - 1,
            (-(clientY - rect.top) / rect.height) * 2 + 1,
          );
    this.camera.updateMatrixWorld();
    this.targetGroup.updateMatrixWorld(true);
    this.ray.setFromCamera(point, this.camera);
    if (this.ray.intersectObject(this.targetFace).length) {
      this.hits++;
      this.acquisitionTimes.push(now - this.acquiredAt);
      this.acquiredAt = now;
      const distance = 18 + Math.random() * 7;
      const maxX = Math.min(
        8,
        distance * Math.tan(THREE.MathUtils.degToRad(35)) * this.camera.aspect * 0.66,
      );
      this.targetGroup.position.set(
        (Math.random() * 2 - 1) * maxX,
        1.6 + Math.random() * 4.5,
        10 - distance,
      );
      // Fixed-world targets make mouse-look require an actual turn, with no aim assistance.
      this.targetGroup.lookAt(this.camera.position);
      this.targetGroup.updateMatrixWorld(true);
      this.projectTarget();
    }
    this.emit(now);
  }
  cancel() {
    this.phase = 'idle';
    this.targetGroup.visible = false;
    this.hits = 0;
    this.shots = 0;
    this.hooks.target(0, 0, 0, false);
    this.emit(performance.now());
  }
  private finish() {
    if (this.phase !== 'running') return;
    this.phase = 'done';
    this.targetGroup.visible = false;
    this.hooks.target(0, 0, 0, false);
    this.emit(performance.now());
    this.hooks.finish({
      duration: this.duration,
      hits: this.hits,
      shots: this.shots,
      accuracy: this.shots ? Math.round((this.hits / this.shots) * 100) : 0,
      averageHitMs: this.acquisitionTimes.length
        ? Math.round(
            this.acquisitionTimes.reduce((a, b) => a + b, 0) / this.acquisitionTimes.length,
          )
        : 0,
      sensitivity: this.sensitivity,
      mode: this.mode,
      acquisitionTimes: [...this.acquisitionTimes],
    });
  }
  private emit(now: number) {
    this.hooks.tick({
      phase: this.phase,
      remaining:
        this.phase === 'done'
          ? 0
          : this.phase === 'running'
            ? Math.max(0, this.duration - (now - this.startsAt) / 1000)
            : this.duration,
      countdown: Math.max(0, Math.ceil((this.startsAt - now) / 1000)),
      hits: this.hits,
      shots: this.shots,
      accuracy: this.shots ? Math.round((this.hits / this.shots) * 100) : 0,
      go: this.phase === 'running' && now - this.startsAt < 600,
    });
    this.lastTick = now;
  }
  private projectTarget() {
    const point = this.targetGroup.position.clone().project(this.camera);
    const edge = this.targetGroup.position
      .clone()
      .add(new THREE.Vector3(0.88, 0, 0))
      .project(this.camera);
    this.hooks.target(
      ((point.x + 1) / 2) * this.width,
      ((-point.y + 1) / 2) * this.height,
      Math.abs(edge.x - point.x) * this.width,
      this.phase === 'running' && point.z < 1 && Math.abs(point.x) < 1 && Math.abs(point.y) < 1,
    );
  }
  private draw = (now: number) => {
    if (this.disposed) return;
    if (this.phase === 'countdown' && now >= this.startsAt) {
      this.phase = 'running';
      this.targetGroup.visible = true;
      this.acquiredAt = now;
    }
    if (this.phase === 'running' && now >= this.startsAt + this.duration * 1000) this.finish();
    const recoil = Math.max(0, 1 - (now - this.shotAt) / 140);
    this.weapon.position.z = -0.8 + recoil * 0.065;
    this.weapon.rotation.x = recoil * 0.08;
    this.weapon.position.y = -0.39 + (this.reduceMotion ? 0 : Math.sin(now * 0.0014) * 0.006);
    this.muzzle.visible = now - this.shotAt < 65 && !this.reduceMotion;
    this.renderer.render(this.scene, this.camera);
    if (this.phase === 'running') this.projectTarget();
    if (now - this.lastTick >= 80) this.emit(now);
    this.frame = requestAnimationFrame(this.draw);
  };
  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.contextListener);
    const materials = new Set<THREE.Material>();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        object.geometry.dispose();
        (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) =>
          materials.add(material),
        );
      }
    });
    materials.forEach((material) => material.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
