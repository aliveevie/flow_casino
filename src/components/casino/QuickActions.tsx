import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <Button variant="outline">Deposit FLOW</Button>
        <Button variant="outline">Withdraw</Button>
        <Button variant="outline">Game History</Button>
      </CardContent>
    </Card>
  );
} 