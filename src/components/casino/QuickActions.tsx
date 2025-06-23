import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        <Button variant="outline" disabled>Game History</Button>
        <p className="text-xs text-muted-foreground text-center pt-2">
          Deposit and Withdraw are handled automatically with each bet.
        </p>
      </CardContent>
    </Card>
  );
} 