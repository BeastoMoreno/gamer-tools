import { ToolDirectory } from '@/components/tool-directory';
export const metadata = { title: 'Your favorites' };
export default function Page() {
  return <ToolDirectory favoritesOnly />;
}
