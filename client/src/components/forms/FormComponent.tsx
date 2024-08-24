import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import { SocketEvent } from "@/types/socket";
import { USER_STATUS } from "@/types/user";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import logo from "@/assets/logo.svg";
import toast from 'react-hot-toast';

const FormComponent = () => {
    const location = useLocation();
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext();
    const { socket } = useSocket();
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();
    const [usernameEntered, setUsernameEntered] = useState(false);

    const createNewRoomId = () => {
        if (!usernameEntered) {
            toast.error('Please enter your username first');
            return;
        }
        if (currentUser.username.length < 3) {
            toast.error('Username must be at least 3 characters long');
            return;
        }
        setCurrentUser({ ...currentUser, roomId: uuidv4() });
        toast.success('Created a new Room ID');
        usernameRef.current?.focus();
    };

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;
        setCurrentUser({ ...currentUser, [name]: value });
        if (name === "username") {
            setUsernameEntered(value.length > 0);
        }
    };

    const validateForm = () => {
        if (currentUser.username.length < 3) {
            toast.error('Username must be at least 3 characters long');
            return false;
        }
        if (currentUser.roomId.length < 5) {
            toast.error('Room ID must be at least 5 characters long');
            return false;
        }
        if (currentUser.username.length === 0) {
            toast.error('Enter your username');
            return false;
        }
        if (currentUser.roomId.length === 0) {
            toast.error('Enter a room ID');
            return false;
        }
        return true;
    };

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (status === USER_STATUS.ATTEMPTING_JOIN) return;
        if (!validateForm()) return;
        toast.loading('Joining room...');
        setStatus(USER_STATUS.ATTEMPTING_JOIN);
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser);
    };

useEffect(() => {
        if (currentUser.roomId.length > 0) return;
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId });
            if (currentUser.username.length === 0) {
                toast.success("Enter your username");
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser]);

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect();
            return;
        }

        const isRedirect = sessionStorage.getItem("redirect") || false;

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username;
            sessionStorage.setItem("redirect", "true");
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            });
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect");
            setStatus(USER_STATUS.DISCONNECTED);
            socket.disconnect();
            socket.connect();
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status]);

    return (
        <div className="flex w-full max-w-[500px] flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-lg shadow-lg">
            <img src={logo} alt="Logo" className="w-92 mb-6" />
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4">
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-300"
                    onChange={handleInputChanges}
                    value={currentUser.username}
                    ref={usernameRef}
                />
                <input
                    type="text"
                    name="roomId"
                    placeholder="Room ID"
                    className="w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all duration-300"
                    onChange={handleInputChanges}
                    value={currentUser.roomId}
                />
                <button
                    type="submit"
                    className="mt-4 w-full rounded-md bg-pink-500 hover:bg-pink-600 px-8 py-3 text-lg font-semibold text-white transition-all duration-300"
                >
                    Join Room
                </button>
            </form>
            <a
                href="#"
                onClick={createNewRoomId}
                className="bg-[#1D4ED8] group relative inline-flex items-center overflow-hidden rounded-full px-8 py-3 transition"
            >
                <div className="absolute inset-0 flex items-center">
                    <div className="absolute h-full w-full animate-spin bg-[conic-gradient(from_0_at_50%_50%,rgba(255,192,203,0.5)_0deg,transparent_60deg,transparent_300deg,rgba(255,192,203,0.5)_360deg)] opacity-0 transition duration-300 group-hover:opacity-100"></div>
                </div>
                <div className="absolute inset-0.5 rounded-full bg-black/90"></div>
                <div className="absolute bottom-0 left-1/2 h-1/3 w-4/5 -translate-x-1/2 rounded-full bg-pink-400/10 opacity-70 blur-md transition-all duration-500 group-hover:h-2/3 group-hover:opacity-100"></div>
                <div className="relative inline-flex items-center gap-2">
                    <span className="font-mona mt-px bg-gradient-to-b from-pink-200/75 to-pink-400 bg-clip-text text-sm font-medium text-transparent transition-all duration-200">
                        Generate Unique Room ID
                    </span>
                </div>
            </a>
        </div>
    );
};

export default FormComponent;
