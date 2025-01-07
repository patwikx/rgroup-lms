import { LoginForm } from "@/components/auth/login-form";
import { EmployeeRegistrationForm } from "@/components/registration/employee-form";
import LeaveRequestPage from "./(protected)/dashboard/leave-request/page";




export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="mt-8">
      
          <LoginForm />
        </div>
    </main>
  )
}
