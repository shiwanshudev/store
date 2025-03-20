import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";

export default function PostPage() {
  const { user, token, loading: authLoading, setUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [selectedPost, setSelectedPost] = useState(null);

  const getPosts = async () => {
    try {
      if (!token) {
        throw new Error("No authorization token found");
      }
      const res = await fetch(`${import.meta.env.VITE_API_URI}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        throw new Error("No authorization token found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URI}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newPost),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Reset the form
      setNewPost({ title: "", content: "" });

      // Refresh the posts
      getPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URI}/api/users/verify`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) {
            throw new Error("Token verification failed");
          }
          const data = await res.json();
          setUser(data.user);
          getPosts();
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, setUser]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  const openModal = (post) => {
    setSelectedPost(post);
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        {user.name.split(" ")[0]}'s Notes
      </h1>

      {!user && (
        <h2 className="text-xl">
          Please{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>{" "}
          to view this page
        </h2>
      )}

      {error && <p className="text-red-500">Error: {error}</p>}

      {user && !error && (
        <>
          <form
            onSubmit={createPost}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="content"
              >
                Content
              </label>
              <textarea
                id="content"
                placeholder="Content"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Create Note
              </button>
            </div>
          </form>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={`p-4 rounded shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
                    index % 2 === 0 ? "bg-blue-100" : "bg-indigo-100"
                  }`}
                  onClick={() => openModal(post)}
                >
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4 overflow-hidden">
                    {post.content.length > 27
                      ? post.content.slice(0, 27) + "..."
                      : post.content}
                  </p>
                  <small className="text-gray-500">
                    Created at: {new Date(post.created_at).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p>No notes available.</p>
          )}
        </>
      )}

      {selectedPost && (
        <div className="fixed inset-0 backdrop-brightness-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full transform transition-transform duration-300 ease-in-out max-h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
              <button
                className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                onClick={closeModal}
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh] break-all">
              <p className="text-gray-700">{selectedPost.content}</p>
              <small className="text-gray-500">
                Created at: {new Date(selectedPost.created_at).toLocaleString()}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
