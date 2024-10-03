import request from "@/api/baseServiceInterceptor";


export function getObjects() {
    return request({
      url: "http://localhost:3000/api/objects",
      method: "get",
    });
}

export function saveObjects(data){
  return request({
    url: "/api/objects",
    method: "post",
    data,
  });
}