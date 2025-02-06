import React, { useContext, useState } from 'react';
import { Button, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import { generateKeyPair } from '../EncryptionDecryption/GenerateKeys.js';
import { useUser } from '../src/Context/UserContest.jsx';

const uploadImageToCloudinary = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', 'chat-app');
  formData.append('cloud_name', 'dqspjvfw6');

  try {
    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dqspjvfw6/image/upload',
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};




const Register = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const {user,setUser}=useUser();


  const directLogin = async (values) => {
    try {
      const res = await axios.post('/api/v1/user/login', values);
      if (res.data.success) {
        localStorage.setItem('chat-token', res.data.token);
        setUser(res.data.user);
        navigate(`/user/${values.username}`);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('Check your details');
    }
  };


  const onFinish = async (values) => {
    try {
      let imageUrl = '';
      if (file) {
        imageUrl = await uploadImageToCloudinary(file);
      }

      const key = await generateKeyPair();
      const formData = { ...values, image: imageUrl, publicKey: key.publicKey };
      localStorage.setItem('privateKey', key.privateKey);

      const res = await axios.post('/api/v1/user/registerData', formData);
      if (res.data.success) {
        directLogin(values);
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error('Something went wrong!');
    }
  };

  const handleFileChange = ({ fileList }) => {
    setFile(fileList.length > 0 ? fileList[0].originFileObj : null);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side - Image/Branding */}
        <div className="register-left">
          <h2>Welcome to Encryptochat</h2>
          <p>Secure your conversations with end-to-end encryption.</p>
        </div>

        {/* Right Side - Form */}
        <div className="register-right">
          <h1 className="register-title">Create an Account</h1>
          <Form
            name="register"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 400, width: '100%' }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Enter a valid email address!' },
            ]}>
              <Input placeholder="Enter your email address" />
            </Form.Item>

            <Form.Item label="Phone Number" name="phone" rules={[
              { required: true, message: 'Please input your phone number!' },
              { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number!' },
            ]}>
              <Input placeholder="Enter your phone number" />
            </Form.Item>

            <Form.Item label="Username" name="username" rules={[
              { required: true, message: 'Please input your username!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Use only letters, numbers, or underscores.' },
              { min: 4, message: 'At least 4 characters!' },
              { max: 20, message: 'Max 20 characters!' },
            ]}>
              <Input placeholder="Enter your username" />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'At least 6 characters!' },
            ]}>
              <Input.Password placeholder="Create a password" />
            </Form.Item>

            <Form.Item label="Profile Picture">
              <Upload
                accept="image/*"
                listType="picture"
                maxCount={1}
                onChange={handleFileChange}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
              </Upload>
            </Form.Item>

            <div className="register-link">
              <Link to="/login">Already have an account? Log in</Link>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Register
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
