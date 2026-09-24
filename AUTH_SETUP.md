# Connect real accounts

The app uses Supabase Auth and an owner-only `profiles` table. Guest tools work without credentials. Email sign-in, signup, confirmation, password reset, OAuth callbacks, session refresh, profile editing, and local sign-out are implemented. Authentication providers and the database must be configured in your own accounts before live sign-in works.

## 1. Project and database

Create or select a Supabase project. In its SQL editor, run `supabase/migrations/202609210001_profiles.sql` once. It creates the profile constraints and row-level policies. A signed-in user may only select, insert, or update the row whose ID equals their authenticated user ID. Anonymous access is revoked. There is no public profile lookup.

Copy `.env.example` to `.env.local`. Add the project's URL and **publishable key** from Supabase's Connect dialog. Never place a service-role key, database password, OAuth secret, or Apple signing key in a `NEXT_PUBLIC_` variable. The app does not need those secrets. Restart the development server after changing environment variables; rebuild for production.

## 2. Email and redirects

Enable the email/password provider and email confirmation. Set the minimum password length to 12 to match the UI. Configure production SMTP in Supabase for email delivery and configure the email sender domain there. Supabase's default email service has development restrictions.

Set Authentication → URL Configuration → Site URL to your actual site origin. Allow these redirect URLs for the origins you use:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/reset-password
http://127.0.0.1:3000/auth/callback
http://127.0.0.1:3000/auth/callback?next=/reset-password
https://YOUR-DOMAIN/auth/callback
https://YOUR-DOMAIN/auth/callback?next=/reset-password
```

Use HTTPS for production. Use the default email templates containing `{{ .ConfirmationURL }}`. The application uses a PKCE authorization-code callback, so open confirmation/reset links in the same browser and origin where the request started. The callback only accepts `/profile` or `/reset-password` as destinations. If a link expired or was opened in another browser, request a new one.

## 3. Optional social providers

Configure each provider in both its developer console and Supabase Authentication → Providers. The provider's authorized callback is your **Supabase** callback (`https://YOUR-PROJECT.supabase.co/auth/v1/callback`), not the app's `/auth/callback`. Supabase then redirects to the app. Put provider secrets only in the provider/Supabase dashboards.

| Provider | Configuration                                                                                                                                         | App flag after setup                     |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Google   | OAuth web client, approved origins/redirect, consent configuration; client ID/secret in Supabase                                                      | `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`   |
| Facebook | Meta app, Facebook Login, valid OAuth redirect, required permissions and live-mode setup; app ID/secret in Supabase                                   | `NEXT_PUBLIC_AUTH_FACEBOOK_ENABLED=true` |
| Apple    | Apple developer configuration for web Sign in with Apple, Services ID, domain/return URL, and signing credentials in Supabase; maintain secret expiry | `NEXT_PUBLIC_AUTH_APPLE_ENABLED=true`    |

Disabled provider buttons remain visible and cannot start a broken sign-in. Enable only providers you have configured. Use provider test accounts during development and finish their production requirements before public launch.

Official instructions: [Supabase server-side Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook), [Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## 4. Verify with your project

- Create an email account, confirm its email, sign out, sign back in, and reset its password using the delivered email.
- Complete and save a profile, reload, then sign in on another browser to verify profile persistence.
- Use two accounts to verify one cannot read or update the other's profile ID through the Supabase API. Verify anonymous API access is denied.
- Complete each enabled social-provider flow, including a canceled consent attempt.
- Test expired links, lost connectivity, and duplicate handles.

These live checks require your configured project and providers. Local tests cover guest/error states and app behavior; they do not certify a remote project's provider settings or row-level policies.

## Data boundaries

Profile identity, avatar color, favorite games, region, platform, DPI, and main-game sensitivity are stored in Supabase. Email/password management stays with Supabase Auth. Favorites, practice history, and preferences stay in this browser's local storage, shared by people using this browser profile; signing out does not erase them. Local export/reset only affects that local data. Account deletion is not implemented in the app; a project administrator can remove an account in Supabase, cascading deletion of its profile.
