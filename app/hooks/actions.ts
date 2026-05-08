const headers = {
  "Content-Type" : "application/json"
}

const handleError = (error:any)=>{
  return error instanceof Error ? error.message : "Server Unreachable";
}




//auth
export const authenticator = async () => {
  try {
    const response = await fetch("/api/v1/auth/upload-auth");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    const { signature, expire, token, publicKey } = data;
    return { signature, expire, token, publicKey };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication request failed");
  }
};

export const register = async(fullName:string, email:string, social:string, password:string, studentId:number, profile:string, profileId:string)=>{
  try {
    const req = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers,
      body: JSON.stringify({fullName, email, social, password, studentId, profile, profileId})
    });
    const data = await req.json();
    if(!data.success) return { success: false, message: data.message}
    return data;
  } catch (error) {
    return { success: false, message: handleError(error)}
  }
}

export const login = async(email:string, password:string)=>{
  try {
    const req = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers,
      body: JSON.stringify({email, password})
    });
    const data = await req.json();
    if(!data.success) return { success: false, message: data.message}
    return data;
  } catch (error) {
    return { success: false, message: handleError(error)}
  }
}

export const logout = async()=>{
  try {
    const req = await fetch("/api/v1/auth/logout", {
      method: "POST",
      headers,
    });
    const data = await req.json();
    if(!data.success) return { success: false, message: data.message}
    return data;
  } catch (error) {
    return { success: false, message: handleError(error)}
  }
}

export const deleteImage = async(userId:string, fileId:string)=>{
  try {
    const req = await fetch(`/api/v1/auth/deleteImage?userId=${userId}&fileId=${fileId}`,{
      method: "DELETE",
      headers,
    });
    const data = await req.json();
    if(!data) return { success: false, message: data.message};
    return data;
  } catch (error) {
    return { success: false, message: handleError(error)}
  }
}
//end of auth


//Data

export const getUser = async(id:string)=> {
  try {
    const req = await fetch(`/api/v1/data/user?id=${id}`, {
      method: "GET",
      headers
    });
    const data = await req.json();
    if(!data.success) return { success: false, message: data.message}
    return data;
  } catch (error) {
    return { success: false, message: handleError(error)}
  }
}

export const updatePostedItem = async(id:string, itemId:string) => {
   try {
    const req = await fetch("/api/v1/update/addItem", {
      method: "POST",
      headers,
      body: JSON.stringify({id, itemId})
    });
    const data = await req.json();
    if(!data.success) return { success: false, message: data.message}
    return data;
  } catch (error) {
    return { success: false, message: handleError(error)}
  }
}

//end of Data