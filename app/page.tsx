import { LoginForm } from "@/components/auth/login-form";
import { HomepageFooter } from "@/components/footer/login-footer";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="mt-8">
          <LoginForm />
        </div>
      </main>
      <HomepageFooter />
    </div>
  );
}