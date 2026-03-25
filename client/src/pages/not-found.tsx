import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Página no encontrada</h1>
          <p className="text-sm text-muted-foreground">
            La página que buscas no existe o ha sido movida.
          </p>
          <Link href="/">
            <Button data-testid="button-go-home">Volver al inicio</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
