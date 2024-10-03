import axios from 'axios'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 120000
})

service.interceptors.request.use(
  (config) => {
    if (config.headers) {
    //   const token = localStorage.getItem('token')
      config.headers['Access-Control-Allow-Origin'] = '*'
      config.headers['Access-Control-Allow-Methods'] = 'GET, PUT, POST, DELETE, HEAD, OPTIONS'

    //   if (token) {
    //     config.headers['Authorization'] = `Bearer ${token}`
    //   }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error?.response?.status === 401) {
    //   useUserStore().setUserToken('')
      router.push({ path: '/' })
    }

    return Promise.reject(error)
  }
)

export default service
