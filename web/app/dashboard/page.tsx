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
import ThemeToggle from "@/components/ThemeToggle";

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
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });
  const [editing, setEditing] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sid = getSessionId();
    if (!sid) {
      router.replace("/signin");
      return;
    }
    setAuthorized(true);
  }, [router]);

  async function load(p = 1) {
    const res = await api.get(`/users?page=${p}&limit=6`);
    setUsers(res.data.items);
    setPages(res.data.pages);
    setPage(res.data.page);
  }
  useEffect(() => {
    if (authorized) {
      load(1);
    }
  }, [authorized]);

  async function createUser() {
    await api.post("/users", {
      firstName: form.firstName,
      lastName: form.lastName,
      password: form.password,
    });
    setForm({ firstName: "", lastName: "", password: "" });
    load(page);
  }
  async function updateUser(id: string, patch: Partial<User>) {
    await api.patch(`/users/${id}`, patch);
    setNotice("User updated successfully");
    setTimeout(() => setNotice(null), 3000);
    load(page);
  }
  async function removeUser(id: string) {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    load(page);
  }
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

  function renderPaginationItems() {
    const items: any[] = [];
    const add = (n: number) =>
      items.push(
        <Pagination.Item key={n} active={n === page} onClick={() => load(n)}>
          {n}
        </Pagination.Item>
      );
    if (pages <= 7) {
      for (let n = 1; n <= pages; n++) add(n);
    } else {
      add(1);
      if (page > 3) items.push(<Pagination.Ellipsis key="ell-l" />);
      const start = Math.max(2, page - 1);
      const end = Math.min(pages - 1, page + 1);
      for (let n = start; n <= end; n++) add(n);
      if (page < pages - 2) items.push(<Pagination.Ellipsis key="ell-r" />);
      add(pages);
    }
    return items;
  }

  const pagination = (
    <Pagination className="mt-3">
      <Pagination.Prev disabled={page <= 1} onClick={() => load(page - 1)} />
      {renderPaginationItems()}
      <Pagination.Next
        disabled={page >= pages}
        onClick={() => load(page + 1)}
      />
    </Pagination>
  );

  if (!authorized) return null;

  return (
    <>
      <Navbar className="mb-3 px-3 app-navbar">
        <Navbar.Brand>User Management</Navbar.Brand>
        <div className="ms-auto d-flex gap-2">
          <div className="ms-auto">
            <ThemeToggle />
          </div>
          <Button variant="outline-danger" onClick={logout}>
            Log Out
          </Button>
        </div>
      </Navbar>

      <Container>
        {notice && (
          <div className="alert alert-success" role="alert">
            {notice}
          </div>
        )}
        <Row className="mb-3">
          <Col>
            <Card className="p-3 app-card">
              <h4 className="mb-3">Create User</h4>
              <Row>
                <Col md={4} className="mb-2">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    placeholder="First name"
                    autoComplete="off"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </Col>
                <Col md={4} className="mb-2">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    placeholder="Last name"
                    autoComplete="off"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </Col>
                <Col md={4} className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    autoComplete="off"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </Col>
                <Col md={2} className="d-flex align-items-end mb-2 ms-auto">
                  <Button className="w-100" onClick={createUser}>
                    Create
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="p-3 app-card">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="mb-0">Users</h4>
                <small>
                  Page {page} of {pages}
                </small>
              </div>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Logins</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>
                          {u.firstName} {u.lastName}
                        </strong>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={u.status}
                          onChange={(e) =>
                            updateUser(u._id, { status: e.target.value as any })
                          }
                          style={{ maxWidth: 140 }}
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Badge bg="secondary">{u.logins}</Badge>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleString()}</td>
                      <td>{new Date(u.updatedAt).toLocaleString()}</td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setEditing(u)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeUser(u._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-center">{pagination}</div>
            </Card>
          </Col>
        </Row>
      </Container>

      {editing && (
        <div className="modal d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditing(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>First name</Form.Label>
                    <Form.Control
                      value={editing.firstName}
                      onChange={(e) =>
                        setEditing({ ...editing!, firstName: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      value={editing.lastName}
                      onChange={(e) =>
                        setEditing({ ...editing!, lastName: e.target.value })
                      }
                    />
                  </Form.Group>
                </Form>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    await updateUser(editing._id, {
                      firstName: editing.firstName,
                      lastName: editing.lastName,
                    });
                    setEditing(null);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
