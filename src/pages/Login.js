import React, { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { Title, Text } = Typography;
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        values
      );
      const { token } = response.data;

      // Save token to localStorage
      localStorage.setItem("token", token);

      message.success("Login successful");
      setLoading(false);
      navigate("/products");
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error(error.response.data.msg || "Login failed");
    }
  };

  return (
    <>
      <Title level={2} style={{ textAlign: "center", margin: "24px 0" }}>
        Login
      </Title>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input your email!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Login
          </Button>
        </Form.Item>
        <Form.Item>
          <Text style={{ display: "block", textAlign: "center" }}>
            Don't have an account? <Link to="/register">Register</Link>
          </Text>
        </Form.Item>
      </Form>
    </>
  );
};

export default Login;
