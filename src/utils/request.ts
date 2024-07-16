import axios,{AxiosInstance,AxiosRequestConfig} from "axios";

class HttpRequest{
    private readonly baseUrl:string;
    constructor(){
        this.baseUrl = 'http://localhost:5175'
    }

    getInsideConfig(){
        const config = {
            baseUrl : this.baseUrl,
            timeout: 80000,
            withCredentials:true,
        }
        return config
    }

    interceptors(instance:AxiosInstance,url:string | number | undefined){
        instance.interceptors.request.use(config=>{
            return config  
        },(error:any)=>{
            return Promise.reject(error)
        })
        
        instance.interceptors.response.use(res => {
            const {data} = res
            console.log('返回数据处理',res)
            return data
        },(error:any) => {
            console.log('error==>',error)
            return Promise.reject(error)
        })
    }

    request(options:AxiosRequestConfig){
        const instance = axios.create()
        options = Object.assign(this.getInsideConfig)
        this.interceptors(instance,options.url)
        return  instance(options)
    }
}

const http = new HttpRequest()
export default http