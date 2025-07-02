import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function TaskModal({ show, onHide, onAdd, onSave, initialTask }) {
  const [name, setName]   = useState("");
  const [type, setType]   = useState("Timer-based");
  const [cycle, setCycle] = useState("");
  const [unit, setUnit]   = useState("Minutes");

  const handleClose = () => {
    setName("");
    setType("Timer-based");
    setCycle("");
    setUnit("Minutes");
    onHide();
  };

  useEffect(() => {
    if (initialTask) {
      setName(initialTask.name);
      setType(initialTask.type);
      setCycle(initialTask.cycle);
      setUnit(initialTask.unit || "Minutes");
    } else {
      setName("");
      setType("Timer-based");
      setCycle("");
      setUnit("Minutes");
    }
  }, [initialTask, show]);

  const handleSubmit = e => {
    e.preventDefault();
    const payload = type === "Timer-based"
      ? { name, type, cycle: Number(cycle), unit }
      : { name, type, cycle };
    initialTask ? onSave(payload) : onAdd(payload);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="custom-modal-width">
      <Modal.Header closeButton>
        <Modal.Title>{initialTask ? "Edit Task" : "Create Task"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3" controlId="formType">
            <Form.Label column xs={3} className="fw-bold text-end">Type</Form.Label>
            <Col xs={9}>
              <Form.Select
                value={type}
                onChange={e => {
                  const t = e.target.value;
                  setType(t);
                  if (t === "Timer-based") {
                    setCycle("");
                    setUnit("Minutes");
                  } else {
                    setCycle("Daily");
                    setUnit(null);
                  }
                }}
              >
                <option>Timer-based</option>
                <option>Reset-based</option>
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formName">
            <Form.Label column xs={3} className="fw-bold text-end">Name</Form.Label>
            <Col xs={9}>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </Col>
          </Form.Group>

          {type === "Timer-based" ? (
            <Form.Group as={Row} className="mb-3" controlId="formCycle">
              <Form.Label column xs={3} className="fw-bold text-end">
                Cycle
              </Form.Label>
              <Col xs="auto">
                <Form.Control
                  type="number"
                  min={1}
                  value={cycle}
                  onChange={e => setCycle(e.target.value)}
                  required
                  style={{ width: "10ch" }}
                />
              </Col>
              <Col xs>
                <Form.Select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                >
                  <option>Minutes</option>
                  <option>Hours</option>
                  <option>Days</option>
                  <option>Weeks</option>
                </Form.Select>
              </Col>
            </Form.Group>
          ) : (
            <Form.Group as={Row} className="mb-3" controlId="formReset">
              <Form.Label column xs={3} className="fw-bold text-end">Cycle</Form.Label>
              <Col xs={9}>
                <Form.Select
                  value={cycle}
                  onChange={e => setCycle(e.target.value)}
                  required
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Yearly</option>
                </Form.Select>
              </Col>
            </Form.Group>
          )}

          <div className="text-end">
            <Button
              type="submit"
              variant="success"
              className="btn-sm me-2"
              style={{ minWidth: 90, minHeight: 32 }}
              onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
              onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}
            >
              {initialTask ? "Save" : "Add"}
            </Button>
            <Button
              variant="danger"
              onClick={handleClose}
              className="btn-sm"
              style={{ minWidth: 90, minHeight: 32 }}
              onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
              onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
