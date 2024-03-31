import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Spin,
  message,
  Tooltip,
  List,
  Form,
  Input,
  Button,
  Image,
} from "antd";
import { Comment } from "@ant-design/compatible";
import moment from "moment";
import withLogout from "../withLogout";
import { LoadingOutlined } from "@ant-design/icons";

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [parentCommentContent, setParentCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const { productId } = useParams();
  const { TextArea } = Input;

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const productResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/product-detail/${productId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setProduct(productResponse.data);

      // Fetch the comments for the product
      const commentsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/comments/product-comments/${productId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setComments(commentsResponse.data);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(
        error.response.data.msg || "Error fetching product details"
      );
    }
  };

  const handleReply = (commentId, commentContent) => {
    // Set the id and content of the parent comment when replying
    setReplyingToCommentId(commentId);
    setParentCommentContent(commentContent);

    document.getElementsByClassName("reply-box")[0].focus();
  };

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async () => {
    if (!commentContent) return;

    setSubmitting(true);
    try {
      // Send the request to post the comment, including the parentCommentId if replying to a comment
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/comments/${productId}`,
        {
          content: commentContent,
          parentCommentId: replyingToCommentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Comment added successfully");
      setCommentContent("");
      const updatedComments = [...comments, response.data];
      setComments(updatedComments);
      setReplyingToCommentId(null);
    } catch (error) {
      message.error("Failed to post comment");
    }
    setSubmitting(false);
  };

  const renderNestedComments = (parentCommentId) => {
    return comments
      .filter((comment) => comment.parentCommentId === parentCommentId)
      .map((nestedComment) => (
        <Comment
          content={nestedComment.content}
          // Include other nested comments (recursive render)
          children={renderNestedComments(nestedComment._id)}
        />
      ));
  };

  if (loading) {
    return (
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
    );
  }

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Card
        className="product-card"
        title={`${product.name} - $${product.price}`}
        cover={
          product.image && <Image alt="product" src={`${product.image}`} />
        }
      >
        uploaded by{" "}
        <span style={{ fontWeight: "bold" }}>{product?.user?.username}</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "10px",
          }}
        >
          {product.address}
        </div>
      </Card>

      {/* Reply Context */}
      {replyingToCommentId && (
        <div
          style={{
            marginBottom: "24px",
            borderLeft: "2px solid #f0f0f0",
            paddingLeft: "16px",
          }}
        >
          <p style={{ fontStyle: "italic" }}>Replying to:</p>
          <p>{parentCommentContent}</p>
          <Button onClick={() => setReplyingToCommentId(null)}>
            Cancel Reply
          </Button>
        </div>
      )}

      {/* Comment Box */}
      <Comment
        className="reply-box"
        avatar="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
        content={
          <Form.Item>
            <TextArea
              rows={4}
              onChange={(e) => setCommentContent(e.target.value)}
              value={commentContent}
            />
            <Button
              htmlType="submit"
              loading={submitting}
              onClick={handleSubmit}
              type="primary"
            >
              Add Comment
            </Button>
          </Form.Item>
        }
      />

      {/* Comment List */}
      <List
        className="comment-list"
        header={`${comments.length} replies`}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={(item) => (
          <li>
            <Comment
              author={item.user.username}
              avatar="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
              content={item.content}
              datetime={
                <Tooltip
                  title={moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                >
                  <span>{moment(item.createdAt).fromNow()}</span>
                </Tooltip>
              }
              actions={[
                <span
                  key="comment-nested-reply-to"
                  onClick={() => handleReply(item._id, item.content)}
                >
                  Reply to
                </span>,
              ]}
            >
              {renderNestedComments(item._id)}
            </Comment>
          </li>
        )}
      />
    </div>
  );
};

export default withLogout(ProductDetailPage);
