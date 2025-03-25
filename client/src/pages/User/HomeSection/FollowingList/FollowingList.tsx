import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiUser from '@/apis/users.api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Navigation from '@/components/Navigation/Navigation';
import RightPart from '@/components/RightPart';


// Định nghĩa kiểu dữ liệu cho User
interface User {
    _id: string;
    name: string;
    username?: string;
    email: string;
    avatar: string | null;
}

interface FollowingItem {
    _id: string;
    user_id: string;
    followed_user_id: string;
    created_at: string;
    followingDetails: User;
}

interface FollowingListProps {
    profile: any;
}

const FollowingList: React.FC<FollowingListProps> = ({ profile }) => {
    const queryClient = useQueryClient();
    const [following, setFollowing] = useState<string[]>([]);

    const { data: followingData, isLoading: isLoadingFollowing } = useQuery({
        queryKey: ['followingList'],
        queryFn: apiUser.getFollowing,
    });

    const followingUsers: FollowingItem[] = followingData?.data?.result.map((item: any) => ({
        _id: item._id,
        user_id: item.user_id,
        followed_user_id: item.followed_user_id,
        created_at: item.created_at,
        followingDetails: item.followingDetails,
    })) || [];

    // Mutation để unfollow người dùng
    const unfollowMutation = useMutation({
        mutationFn: (followed_user_id: string) => apiUser.unfollowUser(followed_user_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['followingList'] });
        },
    });

    // Xử lý follow/unfollow
    const handleFollowToggle = async (userId: string) => {
        try {
            // Unfollow
            await apiUser.unfollowUser(userId);
            setFollowing((prev) => prev.filter((id) => id !== userId));
        } catch (err) {
            console.error('Error toggling follow:', err);
            alert('Không thể thực hiện hành động này. Vui lòng thử lại.');
        }
    };

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
                <div className="bg-indigo-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
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
                <h3 className="text-lg font-semibold text-gray-900">No one followed yet</h3>
                <p className="text-gray-500">Follow someone to see their posts here.</p>
            </div>
        );
    }

    return (
        <div className='bg-black flex min-h-screen max-w-[1500px] mx-auto'>
            <div className="lg:block lg:w-3/12 w-full relative transition-all duration-300">
                <Navigation />
            </div>
            <div className="lg:w-6/12 w-full relative bg-gray-900 shadow-md rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 px-4 py-3 border-b bg-gray-100">
                    Following List
                </h3>
                <div className="divide-y">
                    {followingUsers.map((user) => {
                        const followedUser = user.followingDetails;
                        if (!followedUser) return null;

                        return (
                            <div
                                key={user.followed_user_id}
                                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Avatar */}
                                    <Avatar className="w-12 h-12 border border-gray-300 shadow-sm">
                                        <AvatarImage src={followedUser.avatar || ''} alt={followedUser.name} />
                                        <AvatarFallback className="bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold">
                                            {followedUser.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Thông tin người dùng */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{followedUser.name}</p>
                                        <p className="text-xs text-gray-500 truncate">
                                            @{followedUser.username || followedUser.email.split('@')[0]}
                                        </p>
                                    </div>
                                </div>

                                {/* Nút Unfollow */}
                                <button
                                    className="text-sm text-red-600 hover:text-red-700 transition-all duration-200"
                                    onClick={() => unfollowMutation.mutate(user.followed_user_id)}
                                    // onClick={() => handleFollowToggle(user.followed_user_id)}
                                    disabled={unfollowMutation.isPending}
                                >
                                    {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                                </button>

                            </div>
                        );
                    })}
                </div>
            </div>

          
            <div className="hidden ml-5 lg:block lg:w-4/12 w-full relative">
                <RightPart />
            </div>
        </div>
    );
};

export default FollowingList;
