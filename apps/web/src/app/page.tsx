import { SignInScreen } from '../auth/SignInScreen';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ ended?: string }>;
}) {
  const params = await searchParams;
  return <SignInScreen ended={params.ended === '1'} />;
}
