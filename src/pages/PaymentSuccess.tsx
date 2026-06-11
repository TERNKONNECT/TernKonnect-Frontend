import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, BookOpen, GraduationCap } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { useEnrollmentStore } from "@/stores/enrollmentStore";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reference = params.get("reference");
  const [state, setState] = useState<{
    loading: boolean;
    courseId?: string;
    courseTitle?: string;
    error?: string;
  }>({ loading: true });
  const refreshFromServer = useEnrollmentStore((s) => s.refreshFromServer);

  useEffect(() => {
    if (!reference) {
      setState({ loading: false, error: "Payment reference is missing." });
      return;
    }
    api
      .verifyPayment(reference)
      .then(async (payment) => {
        if (payment.status !== "success") {
          setState({
            loading: false,
            courseId: payment.courseId,
            courseTitle: payment.courseTitle,
            error:
              payment.error ||
              "Payment is still processing. Access will be granted after Paystack confirms the payment.",
          });
          return;
        }
        await refreshFromServer();
        setState({
          loading: false,
          courseId: payment.courseId,
          courseTitle: payment.courseTitle,
        });
      })
      .catch((err: any) => {
        const courseId = err?.courseId;
        // Redirect to failed page with courseId if available
        if (courseId) {
          navigate(
            `/payment/failed?reference=${reference}&courseId=${courseId}`,
            { replace: true },
          );
        } else {
          setState({
            loading: false,
            error: err.message || "Unable to verify payment.",
          });
        }
      });
  }, [reference, refreshFromServer, navigate]);

  if (state.loading) {
    return (
      <MainLayout>
        <div className="container flex min-h-[70vh] items-center justify-center py-12">
          <Card className="w-full max-w-xl">
            <CardContent className="p-10 text-center space-y-5">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Verifying your payment</h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your transaction with Paystack.
                <br />
                Do not close this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (state.error) {
    return (
      <MainLayout>
        <div className="container flex min-h-[70vh] items-center justify-center py-12">
          <Card className="w-full max-w-xl border-destructive">
            <CardContent className="p-10 text-center space-y-5">
              <h1 className="text-2xl font-bold">Payment needs attention</h1>
              <p className="text-muted-foreground">{state.error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/courses">
                  <Button variant="outline">Back to Courses</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <Card className="w-full max-w-xl border-emerald-200">
          <CardContent className="p-10 text-center space-y-6">
            {/* Success icon */}
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Payment Successful!
              </h1>
              {state.courseTitle && (
                <p className="text-lg font-semibold text-primary">
                  {state.courseTitle}
                </p>
              )}
              <p className="text-muted-foreground leading-relaxed">
                Your payment has been confirmed and lifetime access to this
                course is now active. A receipt has been sent to your email.
              </p>
            </div>

            {/* Reference */}
            {reference && (
              <div className="bg-muted rounded-lg px-4 py-3 text-sm">
                <span className="text-muted-foreground">Reference: </span>
                <span className="font-mono font-medium">{reference}</span>
              </div>
            )}

            {/* What's next */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-left space-y-2">
              <p className="font-semibold text-emerald-800">You're all set!</p>
              <ul className="space-y-1 text-emerald-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Full lifetime access to all lessons and modules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Access quizzes and earn your completion certificate
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Invoice receipt sent to your email
                </li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {state.courseId && (
                <Link to={`/learn/${state.courseId}`}>
                  <Button className="gradient-primary text-white font-bold border-0 gap-2 w-full sm:w-auto">
                    <BookOpen className="h-4 w-4" />
                    Start Learning Now
                  </Button>
                </Link>
              )}
              <Link to="/my-learning">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <GraduationCap className="h-4 w-4" />
                  My Learning
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
