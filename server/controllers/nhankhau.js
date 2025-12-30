import { getPersonalProfile, getHouseholdDetails } from "../models/nhankhau.js";
export const getMyInfo = async (req, res) => {
    const { Ma_CCCD } = req.user; 
    try {
        const personal = await getPersonalProfile(Ma_CCCD);

        return res.status(200).json({
            personal
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const getMyInfo1 = async (req, res) => {
    const { Ma_CCCD } = req.user; 
    try {
        const household = await getHouseholdDetails(Ma_CCCD);

        return res.status(200).json({
            household
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};