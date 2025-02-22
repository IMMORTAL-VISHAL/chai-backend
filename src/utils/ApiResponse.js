class ApiResponse {
    constructor(statuscode,dat,message = "Success"){
        this.statuscode = statuscode;
        this.data = dat;
        this.message = message;
        this.success =
            statuscode <400
    }
}