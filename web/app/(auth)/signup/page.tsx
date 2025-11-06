"use client";
import React from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { setSessionId } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Navbar,
} from "react-bootstrap";
import ThemeToggle from "@/components/ThemeToggle";

type FormData = {
  firstName: string;
  lastName: string;
  password: string;
  confirm: string;
};

export default function SignUp() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>();
  const router = useRouter();
  const [alertMsg, setAlertMsg] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);

  const onSubmit = async (data: FormData) => {
    setAlertMsg(null);
    if (data.password !== data.confirm) {
      setError("confirm", { message: "Passwords do not match" });
      return;
    }
    try {
      const res = await api.post("/sessions/signup", {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });
      setSessionId(res.data.sessionId);
      router.replace("/dashboard");
      // Hard navigation fallback for test stability
      if (typeof window !== "undefined") {
        setTimeout(() => {
          if (!window.location.pathname.includes("/dashboard")) {
            window.location.assign("/dashboard");
          }
        }, 0);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Unable to sign up";
      setAlertMsg(msg);
    }
  };

  return (
    <>
      <Navbar className="mb-3 px-3 app-navbar">
        <Navbar.Brand>User Management</Navbar.Brand>
        <div className="ms-auto">
          <ThemeToggle />
        </div>
      </Navbar>
      <Container className="min-vh-100 d-flex align-items-center">
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6}>
            <Card className="p-4">
              <h3 className="mb-3">Sign Up</h3>
              {alertMsg && (
                <div className="alert alert-danger" role="alert">
                  {alertMsg}
                </div>
              )}
              <Form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="firstName">
                      <Form.Label>First name</Form.Label>
                      <Form.Control
                        placeholder="First name"
                        autoComplete="off"
                        {...register("firstName", { required: true })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="lastName">
                      <Form.Label>Last name</Form.Label>
                      <Form.Control
                        placeholder="Last name"
                        autoComplete="off"
                        {...register("lastName", { required: true })}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        autoComplete="off"
                        {...register("password", { required: true })}
                        isInvalid={Boolean(errors.password)}
                      />
                      {errors.password && (
                        <Form.Control.Feedback type="invalid">
                          Password is required
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="confirm">
                      <Form.Label>Confirm password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Re-enter password"
                        autoComplete="off"
                        {...register("confirm", { required: true })}
                        isInvalid={Boolean(errors.confirm)}
                      />
                      {errors.confirm && (
                        <Form.Control.Feedback type="invalid">
                          {errors.confirm.message || "Passwords do not match"}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!ready}
                    data-testid="signup-submit"
                  >
                    Create Account
                  </Button>
                  <Link href="/signin" className="btn btn-outline-secondary">
                    Already have an account? Sign In
                  </Link>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
