import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineBadgeCheck } from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import userApi from '@/apis/users.api';
import RightPart from '@/components/RightPart';
import Navigation from '@/components/Navigation/Navigation';

// Định nghĩa kiểu dữ liệu cho User
interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string | null;
    verified?: boolean;
}

const WhoToFollow: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [following, setFollowing] = useState<string[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const observer = useRef<IntersectionObserver | null>(null);

    const lastUserElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prevPage) => prevPage + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore]
    );

    const fetchUsers = async (pageNum: number, query: string = '') => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (query) {
                response = await userApi.searchUsersByName(query, pageNum, 10);
            } else {
                response = await userApi.getAllUsers(pageNum, 10);
            }

            const fetchedUsers = response.data.result.users.map((user: any) => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null,
                verified: user.verify === 'Verified',
            }));

            if (pageNum === 1) {
                setUsers(fetchedUsers);
            } else {
                setUsers((prevUsers) => [...prevUsers, ...fetchedUsers]);
            }

            setHasMore(pageNum < response.data.result.totalPages);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
        try {
            if (isFollowing) {
                await userApi.unfollowUser(userId);
                setFollowing((prev) => prev.filter((id) => id !== userId));
            } else {
                await userApi.followUser(userId);
                setFollowing((prev) => [...prev, userId]);
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
            alert('Không thể thực hiện hành động này. Vui lòng thử lại.');
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setPage(1);
        setUsers([]);
        setHasMore(true);
    };

    useEffect(() => {
        fetchUsers(page, searchQuery);
    }, [page, searchQuery]);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const response = await userApi.getFollowing();
                const followingIds = response.data.result.map((user: any) => user.followed_user_id.toString());
                setFollowing(followingIds);
            } catch (err) {
                console.error('Error fetching following list:', err);
            }
        };

        fetchFollowing();
    }, []);

    return (
        <div className='bg-black flex min-h-screen max-w-[1500px] mx-auto'>
            <Navigation />
            
            <div className='text-white flex-grow border-l border-r border-gray-700 max-w-2xl sm:ml-[73px] xl:ml-[370px]'>
                <div className='text-[#d9d9d9] flex items-center sm:justify-between py-2 px-3 sticky top-0 z-50 
                    bg-black border-b border-gray-700'>
                    <h2 className='text-lg sm:text-xl font-bold'>Who to Follow</h2>
                </div>
                
                <div className="p-3 border-b border-gray-700 sticky top-12 bg-black z-10">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className='pb-72'>
                    {loading && page === 1 ? (
                        <div className='flex justify-center items-center min-h-[200px]'>
                            <div className='animate-pulse flex space-x-2'>
                                <div className='h-3 w-3 bg-indigo-400 rounded-full'></div>
                                <div className='h-3 w-3 bg-indigo-500 rounded-full'></div>
                                <div className='h-3 w-3 bg-indigo-600 rounded-full'></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {users.length === 0 && !loading && !error && (
                                <div className="text-center text-white py-4">
                                    <p>No users found.</p>
                                </div>
                            )}
                            
                            {users.length > 0 && (
                                <div className="divide-y divide-gray-700">
                                    {users.map((user, index) => {
                                        const isFollowing = following.includes(user._id);
                                        
                                        return (
                                            <div
                                                ref={index === users.length - 1 ? lastUserElementRef : undefined}
                                                key={user._id}
                                                className="p-3 hover:bg-gray-800/30 transition-colors duration-200 flex items-center justify-between"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-indigo-200 text-base font-medium">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <p className="font-medium text-gray-200 text-sm truncate">{user.name}</p>
                                                            {user.verified && <HiOutlineBadgeCheck className="text-indigo-400 h-4 w-4 flex-shrink-0" />}
                                                        </div>
                                                        <p className="text-xs text-gray-400 truncate">@{user.email.split('@')[0]}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleFollowToggle(user._id, isFollowing)}
                                                    disabled={loading}
                                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                                                        isFollowing
                                                            ? 'bg-gray-600 text-gray-400 hover:bg-gray-500 hover:text-gray-200'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                                    }`}
                                                >
                                                    {isFollowing ? 'Following' : 'Follow'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {loading && page > 1 && (
                                <div className="text-center text-gray-400 py-4">
                                    <div className="animate-pulse flex justify-center space-x-2">
                                        <div className="h-3 w-3 bg-indigo-400 rounded-full"></div>
                                        <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                                        <div className="h-3 w-3 bg-indigo-600 rounded-full"></div>
                                    </div>
                                </div>
                            )}
                            
                            {error && (
                                <div className="text-center text-red-400 py-4">
                                    <p>{error}</p>
                                </div>
                            )}
                            
                            {!hasMore && users.length > 0 && (
                                <div className="text-center text-gray-400 py-4">
                                    <p>No more users to load.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            <RightPart />
        </div>
    );
};

export default WhoToFollow;