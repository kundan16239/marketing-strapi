'use strict';

/**
 * campaign controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::campaign.campaign', ({ strapi }) => ({
    async find(ctx) {
        const userId = ctx.state.user.id
        const params = ctx.request.query
        if (params.companyId === undefined) {
            return { success: false, message: "missing query params" }
        }
        const companyTypeData = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            select: ['type'],
            populate: { company: true }
        });
        if (companyTypeData.type === 'company' && companyTypeData.company !== null) {
            if (companyTypeData.company.id !== parseInt(params.companyId)) {
                return { success: "false", message: "CompanyId and JWT not matching" }
            }
        } else {
            return { success: "false", message: "Company Profile is not created" }
        }
        const data = await strapi.db.query('api::campaign.campaign').findMany({
            where: { company: params.companyId },
            select: ['id', 'campaignName'],
        });
        if (data === null) {
            return { success: true, data: "", message: "No Campaign Data" }
        }
        return { success: true, data, message: "Get Campaign Data" }
    },

    async create(ctx) {
        const userId = ctx.state.user.id
        const bodyData = ctx.request.body;
        const { campaignId, companyId, campaignName } = bodyData
        const companyTypeData = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            select: ['type'],
            populate: { company: true }
        });
        if (companyTypeData.type === 'company' && companyTypeData.company !== null) {
            if (companyTypeData.company.id !== companyId) {
                return { success: "false", message: "CompanyId and JWT not matching" }
            }
        } else {
            return { success: "false", message: "Company Profile is not created" }
        }
        const data = {
            campaignName: campaignName,
            company: companyId
        }
        if (campaignId) {
            await strapi.db.query('api::campaign.campaign').update({
                where: { id: campaignId },
                data: data,
            });
            return { message: "updated" }
        } else {
            await strapi.db.query('api::campaign.campaign').create({
                data: data,
            });
            return { success: true, message: "Campaign Created" }
        }
    },
}));