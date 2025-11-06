"use client";
import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
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

type FormData = { firstName: string; lastName: string; password: string };

export default function SignIn() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await api.post("/sessions/signin", data);
      setSessionId(res.data.sessionId);
      router.push("/dashboard");
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401)
          setError("Name or password is incorrect.");
        else if (err.response.status === 403)
          setError("You cannot log in. Please contact the admin.");
        else
          setError(
            err.response.data?.error || "Unable to sign in. Please try again."
          );
      } else {
        setError("Unable to reach the server. Please try again.");
      }
    }
    setTimeout(() => setError(null), 3000);
  };

  return (
    <>
      <Navbar className="mb-3 px-3 app-navbar">
        <Navbar.Brand>User Management</Navbar.Brand>
      </Navbar>
      <Container className="min-vh-100 d-flex align-items-center">
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6}>
            <Card className="p-4">
              <h3 className="mb-3">Sign In</h3>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
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
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    autoComplete="off"
                    {...register("password", { required: true })}
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    Sign In
                  </Button>
                  <Link href="/signup" className="btn btn-outline-secondary">
                    Need an account? Sign Up
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
