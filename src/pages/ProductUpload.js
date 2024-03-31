import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, message, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useLoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import withLogout from "../withLogout";

const { Dragger } = Upload;
const { Title } = Typography;

const ProductUpload = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [coordinates, setCoordinates] = useState([]);
  const [file, setFile] = useState(null);
  const [libraries] = useState(["places"]);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries,
  });

  const handlePlaceSelect = async (addressObject) => {
    const lat = addressObject.geometry.location.lat();
    const lon = addressObject.geometry.location.lng();
    setCoordinates([lon, lat]);
    form.setFieldsValue({
      location: addressObject.formatted_address,
    });
  };

  useEffect(() => {
    if (isLoaded) {
      const autoCompleteRef = new window.google.maps.places.Autocomplete(
        document.getElementById("autocomplete"),
        { types: ["address"] }
      );

      autoCompleteRef.addListener("place_changed", () => {
        const place = autoCompleteRef.getPlace();
        handlePlaceSelect(place);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("price", values.price);
    formData.append("address", values.location);
    console.log(file);
    // Append file if it exists
    if (file) {
      formData.append("image", file);
    }
    formData.append("coordinate", JSON.stringify(coordinates));

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      message.success("Product uploaded successfully");
      form.resetFields();
      navigate("/products"); // Navigate to the home or product list page
    } catch (error) {
      message.error(error.response.data.msg || "Failed to upload product");
    }
  };

  const onUploadChange = (info) => {
    console.log(info);
    // const { status } = info.file;
    // if (status !== "uploading") {
    console.log(info.file);
    setFile(info.file);
    // }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <Title level={2} style={{ textAlign: "center", margin: "24px 0" }}>
        Upload Product
      </Title>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="name"
          label="Product Name"
          rules={[
            { required: true, message: "Please input the product name!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price"
          rules={[
            { required: true, message: "Please input the product price!" },
          ]}
        >
          <Input prefix="$" type="number" />
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
          rules={[
            { required: true, message: "Please input the product location!" },
          ]}
        >
          <Input id="autocomplete" placeholder="Start typing address" />
        </Form.Item>
        <Form.Item
          name="image"
          label="Product Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => e && e.fileList}
          rules={[
            {
              required: true,
              message: "Please upload an image for the product.",
            },
          ]}
        >
          <Dragger
            name="image"
            beforeUpload={() => false}
            onChange={onUploadChange}
            maxCount={1}
            multiple={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default withLogout(ProductUpload);
