'use strict';
const { uploadProductsImagesData, deleteProductsImagesData } = require('../imageUpload')

/**
 * company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company.company', ({ strapi }) => ({

    async getFilterNumber(ctx) {
        const userId = ctx.state.user.id
        const data = await strapi.db.query('api::company.company').findOne({
            where: {
                user: {
                    id: {
                        $eq: userId
                    }
                }
            },
            select: ['noOfFilter'],
        });
        if (data.noOfFilter === null) {
            data.noOfFilter = '0'
        }
        return { success: true, message: "No of Filter Available", data }
    },

    async postFilter(ctx) {
        const userId = ctx.state.user.id
        const data = await strapi.db.query('api::company.company').findOne({
            where: {
                user: {
                    id: {
                        $eq: userId
                    }
                }
            },
            select: ['noOfFilter'],
        });
        if (data.noOfFilter > 0) {
            const entry = await strapi.db.query('api::company.company').update({
                where: {
                    user: {
                        id: {
                            $eq: userId
                        }
                    }
                },
                data: {
                    noOfFilter: parseInt(data.noOfFilter) - 1,
                },
            });
            const filterParams = ctx.request.body
            const { platform, country, language, category, minPrice, maxPrice } = filterParams
            // filter logic to get 10 creator id
            const creatorIdArr = [23, 24]
            const entries = await strapi.db.query('api::creator.creator').findMany({
                select: ['displayName', 'displayPicture', 'verifiedProfile'],
                where: { id: creatorIdArr },
                populate: { youtube: true, instagram: true, 'youtube.minCharges': true },
            });
            return { success: true, message: "Filter Data", data: entries }
        } else {
            return { success: false, message: "No of Available Filter is Zero ", data: null }
        }
    },

    async find(ctx) {
        const userId = ctx.state.user.id
        const data = await strapi.db.query('api::company.company').findOne({
            where: {
                user: {
                    id: {
                        $eq: userId
                    }
                }
            },
        });
        if (data === null) {
            return { success: true, data: "", message: "Empty Company Account Info" }
        }
        return { success: true, data, message: "Get Company Account Info" }
    },

    async create(ctx) {
        const userId = ctx.state.user.id
        const data = await strapi.db.query('api::company.company').findOne({
            where: {
                user: {
                    id: {
                        $eq: userId
                    }
                }
            },
            populate: { user: true },
        });

        const bodyData = JSON.parse(ctx.request.body.data);
        const { companyName, mobileNumber, taxNumber, websiteUrl, appUrl } = bodyData
        const imageBaseData = ctx.request.body.imageData
        const updateData = {
            companyName: companyName,
            mobileNumber: mobileNumber,
            taxNumber: taxNumber,
            websiteUrl: websiteUrl,
            appUrl: appUrl,
            user: userId
        }

        let imageDelete = false
        if (imageBaseData != null) {
            const imgInfo = await uploadProductsImagesData(imageBaseData)
            if (imgInfo.message === 'Successfull') {
                updateData.profileUrl = imgInfo.data.imageURL;
            }
            imageDelete = true
        }
        if (data !== null) {
            if (imageDelete === true) {
                await deleteProductsImagesData(data.profileUrl)
            }
            delete updateData.user
            await strapi.db.query('api::company.company').update({
                where: { id: data.id },
                data: updateData,
            });

            return { success: true, message: "Company Account Info updated" }
        }
        const checkData = await strapi.db.query('api::company.company').create({
            data: updateData,
        });
        return { success: true, message: "Company Account Info created" }

    },







}));