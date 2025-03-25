import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminApi from '@/apis/admin.api'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { User, UserListParams } from '@/types/Admin.types'

export default function UserManagement() {
  const queryClient = useQueryClient()
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    limit: 10,
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    account_type: undefined,
    verification_status: undefined
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => adminApi.getUserList(params)
  })

  const userList = data?.data?.result

  const updateStatusMutation = useMutation({
    mutationFn: ({ user_id, status }: { user_id: string; status: number }) =>
      adminApi.updateUserStatus(user_id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update user status')
    }
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ user_id, role }: { user_id: string; role: string }) => adminApi.updateUserRole(user_id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User role updated successfully')
    },
    onError: () => {
      toast.error('Failed to update user role')
    }
  })

  const handleParamChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setParams((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParams((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  const handleUpdateStatus = (user_id: string, status: number) => {
    updateStatusMutation.mutate({ user_id, status })
  }

  const handleUpdateRole = (user_id: string, role: string) => {
    updateRoleMutation.mutate({ user_id, role })
  }

  const getVerificationStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Unverified'
      case 1:
        return 'Verified'
      case 2:
        return 'Banned'
      default:
        return 'Unknown'
    }
  }

  const getVerificationStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-100 text-yellow-800'
      case 1:
        return 'bg-green-100 text-green-800'
      case 2:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccountTypeText = (type: number) => {
    switch (type) {
      case 0:
        return 'Free'
      case 1:
        return 'Premium'
      case 2:
        return 'Platinum'
      default:
        return 'Unknown'
    }
  }

  const getAccountTypeColor = (type: number) => {
    switch (type) {
      case 0:
        return 'bg-gray-100 text-gray-800'
      case 1:
        return 'bg-blue-100 text-blue-800'
      case 2:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading)
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )

  if (error) return <div className='text-red-500 text-center p-5'>Error loading user list. Please try again.</div>

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <motion.h1
        className='text-3xl font-bold mb-8 text-gray-800'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        User Management
      </motion.h1>

      <motion.div
        className='bg-white rounded-lg shadow-md p-6 mb-8'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className='flex flex-col md:flex-row justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-800'>User List</h2>
          <form onSubmit={handleSearch} className='mt-2 md:mt-0 flex'>
            <input
              type='text'
              name='search'
              value={params.search}
              onChange={handleParamChange}
              placeholder='Search users...'
              className='border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button
              type='submit'
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md transition-colors'
            >
              Search
            </button>
          </form>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Account Type</label>
            <select
              name='account_type'
              value={params.account_type}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Types</option>
              <option value='0'>Free</option>
              <option value='1'>Premium</option>
              <option value='2'>Platinum</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Verification Status</label>
            <select
              name='verification_status'
              value={params.verification_status}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Statuses</option>
              <option value='0'>Unverified</option>
              <option value='1'>Verified</option>
              <option value='2'>Banned</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Sort By</label>
            <select
              name='sort_by'
              value={params.sort_by}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='created_at'>Registration Date</option>
              <option value='last_active'>Last Active</option>
              <option value='name'>Name</option>
              <option value='username'>Username</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Sort Order</label>
            <select
              name='sort_order'
              value={params.sort_order}
              onChange={handleParamChange}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='desc'>Descending</option>
              <option value='asc'>Ascending</option>
            </select>
          </div>
        </div>
      </motion.div>

      {userList && (
        <motion.div
          className='bg-white rounded-lg shadow-md overflow-hidden'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    User
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Email
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Account Type
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Status
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Registration Date
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Last Active
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {userList.users.map((user: User) => (
                  <tr key={user._id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <img
                            className='h-10 w-10 rounded-full'
                            src={user.avatar || 'https://via.placeholder.com/40'}
                            alt=''
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{user.name}</div>
                          <div className='text-sm text-gray-500'>@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{user.email}</td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAccountTypeColor(user.typeAccount)}`}
                      >
                        {getAccountTypeText(user.typeAccount)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationStatusColor(user.verify)}`}
                      >
                        {getVerificationStatusText(user.verify)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(user.last_active).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <select
                          className='text-xs border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                          value={user.verify}
                          onChange={(e) => handleUpdateStatus(user._id, Number(e.target.value))}
                        >
                          <option value={0}>Set Unverified</option>
                          <option value={1}>Set Verified</option>
                          <option value={2}>Ban User</option>
                        </select>
                        <select
                          className='text-xs border border-gray-300 rounded py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                          onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                          defaultValue=''
                        >
                          <option value='' disabled>
                            Change Role
                          </option>
                          <option value='user'>User</option>
                          <option value='moderator'>Moderator</option>
                          <option value='admin'>Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing <span className='font-medium'>{userList.users.length}</span> of{' '}
              <span className='font-medium'>{userList.pagination.total}</span> users
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => handlePageChange(params.page! - 1)}
                disabled={params.page === 1}
                className={`px-3 py-1 rounded-md ${params.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300`}
              >
                Previous
              </button>
              <div className='flex space-x-1'>
                {Array.from({ length: Math.min(5, userList.pagination.total_pages) }, (_, i) => {
                  const page = params.page! <= 3 ? i + 1 : params.page! - 2 + i
                  if (page > userList.pagination.total_pages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md border ${params.page === page ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  )
                })}
                {params.page! + 2 < userList.pagination.total_pages && (
                  <>
                    <span className='self-center'>...</span>
                    <button
                      onClick={() => handlePageChange(userList.pagination.total_pages)}
                      className={`px-3 py-1 rounded-md border ${params.page === userList.pagination.total_pages ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                      {userList.pagination.total_pages}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => handlePageChange(params.page! + 1)}
                disabled={params.page === userList.pagination.total_pages}
                className={`px-3 py-1 rounded-md ${params.page === userList.pagination.total_pages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border border-gray-300`}
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
