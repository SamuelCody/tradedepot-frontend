import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { Title, Text } = Typography;
  const [autocomplete, setAutocomplete] = useState(null);
  const [form] = Form.useForm();
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [coordinates, setCoordinates] = useState({});
  const [libraries] = useState(["places"]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY, // Replace with your API key
    libraries,
  });

  const handlePlaceSelect = async (addressObject) => {
    const addressText = addressObject.formatted_address;
    const lat = addressObject.geometry.location.lat();
    const lon = addressObject.geometry.location.lng();

    setAddress(addressText);
    setCoordinates({
      ...address,
      street: addressText,
      location: {
        type: "Point",
        coordinates: [lon, lat],
      },
    });

    // Set the address in the form field for validation and submission
    form.setFieldsValue({
      address: addressText,
    });
  };

  const onFinish = async (values) => {
    setLoading(true);

    const user = {
      ...values,
      address: { street: values?.address, location: coordinates?.location },
      phone: phoneNumber,
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/signup`,
        user
      );
      message.success("Registration successful");
      form.resetFields();
      setLoading(false);

      navigate("/login");
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error(error.response.data.msg || "Registration failed");
    }
  };

  useEffect(() => {
    if (isLoaded && autocomplete === null) {
      const autoCompleteRef = new window.google.maps.places.Autocomplete(
        document.getElementById("autocomplete"),
        { types: ["address"] }
      );

      autoCompleteRef.addListener("place_changed", () => {
        const place = autoCompleteRef.getPlace();
        handlePlaceSelect(place);
      });

      setAutocomplete(autoCompleteRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <Title level={2} style={{ textAlign: "center", margin: "24px 0" }}>
        Register
      </Title>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            {
              required: true,
              message: "Please input your phone number!",
            },
            () => ({
              validator(_, value) {
                if (!value || (phoneNumber && phoneNumber.length > 8)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Please enter a valid phone number!")
                );
              },
            }),
          ]}
        >
          <PhoneInput
            international
            defaultCountry="NG"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="Enter phone number"
          />
        </Form.Item>
        {/* Google Places Autocomplete Input */}
        <Form.Item
          name="address"
          label="Address"
          rules={[
            {
              required: true,
              message: "Please select your address from the dropdown",
            },
          ]}
        >
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            id="autocomplete"
            placeholder="Start typing address"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
        </Form.Item>
        <Form.Item>
          <Text style={{ display: "block", textAlign: "center" }}>
            Already have an account? <Link to="/login">Login</Link>
          </Text>
        </Form.Item>
      </Form>
    </>
  );
};

export default Register;
