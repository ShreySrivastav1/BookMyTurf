const ownerAuthn = async(req,res,next) => {
    try{
        const loggedInUser = req.user;
        if(loggedInUser.role !== "owner"){
            throw new Error("Access denied!");
        }
        next();

    }catch(err){
        res.status(403).send("Only owners can access this route")
    }
    
}

module.exports = {ownerAuthn};