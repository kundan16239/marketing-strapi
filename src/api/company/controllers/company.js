'use strict';
const { uploadProductsImagesData, deleteProductsImagesData } = require('../imageUpload')

/**
 * company controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::company.company', ({ strapi }) => ({

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
        delete data.id

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
            const infoUpdate = await strapi.db.query('api::company.company').update({
                where: { id: 3 },
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