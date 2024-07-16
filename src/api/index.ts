import http from '../utils/request'

export function getTest(params:any)
{
    return http.request(
        {
            url:'/test',
            method:'get',
            params
        }
    )
}

// export function (params:any)
// {
//     return http.request(
//         {
//             url:'/test',
//             method:'get',
//             params
//         }
//     )
// }