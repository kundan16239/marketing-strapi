'use strict';

/**
 * creator controller
 */
const { uploadProductsImagesData, deleteProductsImagesData } = require('../../company/imageUpload')
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::creator.creator', ({ strapi }) => ({

    async find(ctx) {
        const userId = ctx.state.user.id
        const data = await strapi.db.query('api::creator.creator').findOne({
            where: {
                user: {
                    id: {
                        $eq: userId
                    }
                }
            },
            populate: { platforms: true }
        });
        if (data === null) {
            return { success: true, data: "", message: "Empty Creator Account Info" }
        }
        delete data.id
        return { success: true, data, message: "Get Creator Account Info" }
    },

    async create(ctx) {
        const userId = ctx.state.user.id
        const creatorCheck = await strapi.db.query('api::creator.creator').findOne({
            where: {
                user: {
                    id: {
                        $eq: userId
                    }
                }
            },
            populate: { user: true, platforms: true },
        });
        const creatorData = JSON.parse(ctx.request.body.data);
        const platformData = JSON.parse(ctx.request.body.platformData);
        const displayImageData = ctx.request.body.imageData;
        const { displayName, mobileNumber, country, language, verifiedProfile, affiliateMarketing, category } = creatorData
        const creatorUpdateData = {
            displayName: displayName,
            mobileNumber: mobileNumber,
            country: country,
            language: language,
            verifiedProfile: verifiedProfile,
            affiliateMarketing: affiliateMarketing,
            category: category,
            user: userId
        }
        let imageDelete = false
        if (displayImageData != null) {
            const imgInfo = await uploadProductsImagesData(displayImageData)
            if (imgInfo.message === 'Successfull') {
                creatorUpdateData.displayPicture = imgInfo.data.imageURL;
            }
            imageDelete = true
        }
        if (creatorCheck !== null) {
            if (imageDelete === true) {
                await deleteProductsImagesData(creatorCheck.displayPicture)
            }
            delete creatorUpdateData.user
            await strapi.db.query('api::creator.creator').update({
                where: { id: creatorCheck.id },
                data: creatorUpdateData,
            });
            if (platformData !== null) {
                if (creatorCheck.platforms.length === 0) {
                    for (const x of platformData.platform) {
                        x.creator = creatorCheck.id
                        await strapi.db.query('api::platform.platform').create({
                            data: x
                        });
                    }
                }
                if (creatorCheck.platforms.length > 0) {
                    const obj1 = platformData.platform
                    const obj2 = creatorCheck.platforms
                    const commonArr = obj1.filter(function(o1) {
                        return obj2.some(function(o2) {
                            return o1.platformName == o2.platformName;
                        });
                    });
                    const diffArr = obj1.filter(function(o1) {
                        return !obj2.some(function(o2) {
                            return o1.platformName == o2.platformName;
                        });
                    });
                    console.log(commonArr, diffArr)
                    for (const x of commonArr) {
                        await strapi.db.query('api::platform.platform').update({
                            where: { platformName: x.platformName, creator: creatorCheck.id },
                            data: x,
                        });
                    }
                    for (const x of diffArr) {
                        x.creator = creatorCheck.id
                        await strapi.db.query('api::platform.platform').create({
                            data: x
                        });
                    }
                }
            }
            return { success: true, message: "Creator Account Info updated" }
        }
        const checkData = await strapi.db.query('api::creator.creator').create({
            data: creatorUpdateData,
        });
        const creatorId = checkData.id
        if (platformData !== null) {
            for (const x of platformData.platform) {
                x.creator = creatorId
                await strapi.db.query('api::platform.platform').create({
                    data: x
                });
            }
        }

        return { success: true, message: "Creator Account Info created" }
    }
}));