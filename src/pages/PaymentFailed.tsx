import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, CreditCard } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PaymentFailed = () => {
  const [params] = useSearchParams();
  const courseId = params.get("courseId");
  const reference = params.get("reference");

  return (
    <MainLayout>
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <Card className="w-full max-w-xl border-destructive/30">
          <CardContent className="p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Payment was not completed</h1>
              <p className="text-muted-foreground">
                We could not confirm a successful Paystack payment for this
                course, so access has not been activated.
              </p>
            </div>

            {reference && (
              <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                <span className="text-muted-foreground">Reference: </span>
                <span className="font-mono font-medium">{reference}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {courseId && (
                <Link to={`/courses/${courseId}`}>
                  <Button className="gradient-primary text-white border-0 gap-2 w-full sm:w-auto">
                    <CreditCard className="h-4 w-4" />
                    Try Again
                  </Button>
                </Link>
              )}
              <Link to="/courses">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentFailed;
