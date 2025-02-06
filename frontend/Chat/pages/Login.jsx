import React from 'react';
import { Button, Form, Input, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../src/Context/UserContest';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const onFinish = async (values) => {
    try {
      const res = await axios.post('/api/v1/user/login', values);
      if (res.data.success) {
        localStorage.setItem('chat-token', res.data.token);
        setUser(res.data.user);
        navigate('/wantedRecovery');
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('Check your details');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Encryptochat Login</h1>
        <Form
          name="login"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          style={{ maxWidth: 400, width: '100%' }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, or underscores.' },
              { min: 4, message: 'At least 4 characters!' },
              { max: 20, message: 'Max 20 characters!' },
            ]}
          >
            <Input
              placeholder="Enter your username"
              style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'At least 6 characters!' },
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none' }}
            />
          </Form.Item>

          <div className="login-link">
            <Link to="/register">Don't have an account? Register here</Link>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
