import {Oauth2Client} from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const client = new Oauth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthHandler=async(req,res)=>{
    try{
        const {credential}=req.body;

        if(!credential){
            return res.status(400).json({message:'Credential is required'});
        }

        const ticket=await client.verifyIdToken({
            idToken:credential,
            audience:process.env.GOOGLE_CLIENT_ID,
        });
        const payload=ticket.getPayload();
        const {sub:googleId,email,name:displayName,picture:profilePicture}=payload;

            let user = await User.findOn({googleId});
            if(!user){
              console.log(`Registering new user account:${email}`);
              user= new User({
                googleId,
                email,
                displayName,
                profilePicture,
              });
              await user.save();
            }else{
                console.log(`Logging the user :${email}`);
            }
            const token=jwt.sign(
                {userId:user._id,email:user.email},
                process.env.JWT_SECRET,
                {expiresIn:'7d'}
            );
            return res.status(200).json
            ({
                message:'Authentication successful',
                token,
                user:{
                    id:user._id,
                    email:user.email,
                    displayName:user.displayName,
                    profilePicture:user.profilePicture,

                }
            })

            
    }
    catch(error){
        console.error('Error during Google authentication:',error);
        return res.status(500).json({message:'Internal server error'});
    }
}