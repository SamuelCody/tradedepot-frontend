import React, { useEffect, useState } from "react";
import {
  List,
  Card,
  Button,
  Empty,
  Image,
  message,
  Spin,
  Pagination,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import withLogout from "../withLogout";
import { LoadingOutlined } from "@ant-design/icons";

const ProductsNearMe = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/nearme`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.msg || "Error fetching products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onCardClick = (productId) => {
    navigate(`/product-detail/${productId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Button
          type="primary"
          onClick={() => navigate("/upload")}
          style={{ marginBottom: 16 }}
        >
          Upload New Product
        </Button>
      </div>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 24,
                }}
                spin
              />
            }
          />
        </div>
      ) : products.length > 0 ? (
        <>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 4,
              lg: 4,
              xl: 6,
              xxl: 3,
            }}
            dataSource={products}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className="product-card"
                  hoverable
                  onClick={() => onCardClick(item._id)} // Handle card click
                  title={`${item.name} - $${item.price}`}
                  cover={
                    item.image && <Image alt="product" src={`${item.image}`} />
                  }
                >
                  uploaded by{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {item?.user?.username}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "10px",
                    }}
                  >
                    {item.address}
                  </div>
                </Card>
              </List.Item>
            )}
          />
          {products.length > 0 && (
            <Pagination
              current={currentPage}
              total={totalPages * 10}
              pageSize={10}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          )}
        </>
      ) : (
        <Empty description={<span>No Products Near You</span>}>
          <Button type="primary" onClick={() => navigate("/upload")}>
            Upload Product
          </Button>
        </Empty>
      )}
    </>
  );
};

export default withLogout(ProductsNearMe);
