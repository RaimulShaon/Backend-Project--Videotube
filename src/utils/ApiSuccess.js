class ApiSuccess {
    constructor(status = "", message= "", data = null) {
        this.status = status;
        this.data = data;
        this.message = message; 

    }
}

export default  ApiSuccess;