import { query } from "express";
import { pool } from "../../config/db.config.js";
import { BaseError } from "../../config/error.js";
import { status } from "../../config/response.status.js";
import { UserNicknameToClothId, UserCategoryToClothId, 
    getClothByClothId, getUserIdToClothId, getUser, getFitToUserId, getStyleToUserId, 
    UserNicknameToClothName, UserCategoryToClothName, 
    brandToBrandName, userIdToNickname, userToNickname, getBrandToBrandId,
    userToBrand, categoryToBrand, clothToBrand, clothCategoryToBrand } from "./search.sql.js";

// nickname+cloth 반환
    export const getNicknameToClothId = async (category) => {
    try {
        const conn = await pool.getConnection();
        
        if(typeof category == "undefined"){
            const [data] = await pool.query(UserNicknameToClothId);
            conn.release();
            return data;
        }else{
            const [data] = await pool.query(UserCategoryToClothId, category);
            conn.release();
            return data;
        }
    } catch (err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

export const getPreviewCloth = async (clothId) => {
    try {
        const conn = await pool.getConnection();
        const cloth = await pool.query(getClothByClothId, clothId);

        if(cloth[0].length == 0){
            throw new BaseError(status.BAD_REQUEST);
        }
        conn.release();
            
        return cloth;
    } catch (err) {
        if (err.data.code === status.BAD_REQUEST.code) {
            throw err;
        }
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// user 정보 반환
export const getUserToClothId = async (clothId) => {
    try {
        const conn = await pool.getConnection();
        const userData =await pool.query(getUserIdToClothId, clothId);

        const userId = userData[0][0].uuid;

        const user = await pool.query(getUser, userId);
        if(user[0].length == 0 ){
            throw new BaseError(status.MYPROFILE_EMPTY_DATA);
        }

        const fit = await pool.query(getFitToUserId, userId);
        const style = await pool.query(getStyleToUserId, userId);

        if(user.length == 0){
            return -1;
        }

        conn.release();
        return [ user, fit, style ];
        
    } catch (err) {
        if (err.data.code === "MYPROFILE002") {
            throw err;
        }
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}


// nickname+cloth 반환
export const getNicknameToClothName = async (clothName, category) => {
    try {
        const conn = await pool.getConnection();
        
        if(typeof category == "undefined"){
            const [data] = await pool.query(UserNicknameToClothName, clothName);
            conn.release();
            return data;
        }else{
            const [data] = await pool.query(UserCategoryToClothName, [clothName, category]);
            conn.release();
            return data;
        }
    } catch (err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// 통합검색 brand 조회
export const getPreviewBrand = async (brandName) => {
    try {
        const conn = await pool.getConnection();
        const [data] = await pool.query(brandToBrandName, brandName);
        conn.release();
        return data;
    } catch (err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// 통합검색 user 조회
export const getPreviewUser = async (userName) => {
    try {
        const conn = await pool.getConnection();
        const [userData] = await pool.query(userIdToNickname, userName);
        const result = [];

        if(userData.length == 0){
            conn.release();
            return -1;
        }else{
            for (let i = 0; i < userData.length; i++) {
                const userId = userData[i].uuid;
                const [user] = await pool.query(userToNickname, userId);
                const [fit] = await pool.query(getFitToUserId, userId);
                const [style] = await pool.query(getStyleToUserId, userId);
                result.push({user, fit, style});
            }
            conn.release();
            return result;
        }
    } catch (err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}


// brand 상세 조회
export const getBrand = async (brandId) => {
    try {
        const conn = await pool.getConnection();
        const brand = await pool.query(getBrandToBrandId, brandId);
        if(brand[0].length == 0){
            throw new BaseError(status.PARAMETER_IS_WRONG);
        }
        conn.release();
        return brand;
    } catch (err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

// brand cloth 조회
export const getNicknameToBrand = async (brandId, clothName, category) => {
    try {
        const conn = await pool.getConnection();
 
        if(typeof clothName == "undefined" && typeof category == "undefined"){
            const [data] = await pool.query(userToBrand, brandId);
            conn.release();
            return data;
        }else if(typeof clothName == "undefined"){
            const [data] = await pool.query(categoryToBrand, [brandId, category]);
            conn.release();
            return data;
        }else if(typeof category == "undefined"){
            const [data] = await pool.query(clothToBrand, [brandId, clothName]);
            conn.release();
            return data;
        }else{
            const [data] = await pool.query(clothCategoryToBrand, [brandId, clothName, category]);
            conn.release();
            return data;
        }
    } catch (err) {
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}