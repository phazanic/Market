import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminDashboardWrapperProps {
  title: string
  actionButton?: ReactNode
  children: ReactNode
}

export function AdminDashboardWrapper({ title, actionButton, children }: AdminDashboardWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {actionButton && <div>{actionButton}</div>}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{title} List</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
