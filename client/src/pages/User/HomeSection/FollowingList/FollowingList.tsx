import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiUser from '@/apis/users.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Định nghĩa kiểu dữ liệu cho User
interface User {
    _id: string;
    name: string;
    avatar: string | null;
}

interface FollowingListProps {
    profile: any; // Thêm profile để hiển thị thông tin người dùng hiện tại
}

const FollowingList: React.FC<FollowingListProps> = ({ profile }) => {
    // Lấy danh sách người dùng đang theo dõi
    const { data: followingData, isLoading: isLoadingFollowing } = useQuery({
        queryKey: ['followingList'],
        queryFn: apiUser.getFollowing,
    });

    const followingUsers = followingData?.data?.result || [];

    if (isLoadingFollowing) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-pulse flex space-x-2">
                    <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                    <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                </div>
            </div>
        );
    }

    if (!followingUsers || followingUsers.length === 0) {
        return (
            <div className="py-12 px-4 text-center">
                <div className="bg-indigo-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No one followed yet</h3>
                <p className="text-gray-500 mb-6">Follow someone to see their posts here</p>
            </div>
        );
    }

    return (
        <div className="divide-y cursor-pointer bg-black-700">
            {followingUsers.map((user: any) => (
                <div
                    key={user.followed_user_id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                    <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <Avatar className="w-10 h-10 border border-gray-200">
                            <AvatarImage src={user.followingDetails.avatar} alt={user.followingDetails.name} />
                            <AvatarFallback className="bg-gradient-to-r from-violet-200 to-indigo-200 text-indigo-600">
                                {user.followingDetails.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Thông tin người dùng */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{user.followingDetails.name}</p>
                            <p className="text-xs text-gray-500 truncate">@{user.followingDetails.username || user.followingDetails.email?.split('@')[0]}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FollowingList;