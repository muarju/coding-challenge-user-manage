"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { clearSession, getSessionId } from "@/lib/auth";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Navbar,
  Pagination,
  Badge,
} from "react-bootstrap";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  status: "active" | "inactive";
  logins: number;
  createdAt: string;
  updatedAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  async function logout() {
    await api.post("/sessions/logout");
    clearSession();
    router.replace("/signin");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (!window.location.pathname.endsWith("/signin")) {
          window.location.assign("/signin");
        }
      }, 0);
    }
  }

  return (
    <>
      <Navbar className="mb-3 px-3 app-navbar">
        <Navbar.Brand>User Management</Navbar.Brand>
        <div className="ms-auto d-flex gap-2">
          <Button variant="outline-danger" onClick={logout}>
            Log Out
          </Button>
        </div>
      </Navbar>
      <Container>
        <Row>
          <Col>
            <Card className="p-3 app-card">Welcome </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
