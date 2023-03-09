'use strict';

/**
 * contract controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::contract.contract', ({ strapi }) => ({
    async getAllContract(ctx) {
        const userId = ctx.state.user.id
        const userData = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            select: ['type'],
            populate: { company: true, creator: true }
        });
        let contractData
        if (userData.type === 'company' && userData.company) {
            contractData = await strapi.db.query('api::contract.contract').findMany({
                where: { company: userData.company.id },
                populate: { creator: true }
            });
            return { success: true, message: "Get All Contract Data For Company", data: contractData }
        }
        if (userData.type === 'creator' && userData.creator) {
            contractData = await strapi.db.query('api::contract.contract').findMany({
                where: { creator: userData.creator.id },
                populate: { company: true }
            });
            return { success: true, message: "Get All Contract Data For Creator", data: contractData }
        }
        return { success: false, message: "Profile Not Created" }

    },

    async find(ctx) {
        const userId = ctx.state.user.id
        const params = ctx.request.query
        if (params.creatorId === undefined || params.companyId === undefined) {
            return { success: false, message: "missing query params" }
        }
        const companyTypeData = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            select: ['type'],
            populate: { company: true, creator: true }
        });
        if (companyTypeData.type === 'company' && companyTypeData.company !== null) {
            if (companyTypeData.company.id !== parseInt(params.companyId)) {
                return { success: "false", message: "CompanyId and JWT not matching" }
            }
        } else {
            if (companyTypeData.creator.id !== parseInt(params.creatorId)) {
                return { success: "false", message: "CreatorId and JWT not matching" }
            }
        }
        const data = await strapi.db.query('api::contract.contract').findMany({
            where: {
                $and: [{
                        company: params.companyId
                    },
                    {
                        creator: params.creatorId
                    }
                ]
            }
        });
        return { success: true, data, message: "Get All Contracts" }
    },

    async create(ctx) {
        const userId = ctx.state.user.id
        const bodyData = ctx.request.body;
        const { status, creatorId, companyId, contractId } = bodyData
        const companyTypeData = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { id: userId },
            select: ['type'],
            populate: { company: true, creator: true }
        });
        if (companyTypeData.type === 'company' && companyTypeData.company !== null) {
            if (companyTypeData.company.id !== companyId) {
                return { success: "false", message: "CompanyId and JWT not matching" }
            }
        } else {
            if (companyTypeData.creator.id !== creatorId) {
                return { success: "false", message: "Company Profile is not created" }
            }
        }
        let contractData
        if (contractId) {
            contractData = await strapi.db.query('api::contract.contract').findOne({
                where: {
                    $and: [{
                            company: companyId
                        },
                        {
                            creator: creatorId
                        },
                        {
                            id: contractId
                        }
                    ]
                },
                select: ['contractStatus'],
            });
            if (!contractData) {
                return { success: false, message: "No Contract Exist with this id" }
            }
        }
        let contractStatus
        if (contractData) {
            contractStatus = parseInt(contractData.contractStatus)
        } else {
            contractStatus = 0
        }
        if (contractData && parseInt(status) > (parseInt(contractStatus) + 1)) {
            if (contractStatus === 10) {
                return { success: false, message: "Contract Cancelled" }
            }
            if (contractStatus === 7) {
                return { success: false, message: "Contract Completed" }
            }
            if (contractStatus < 5) {
                return { success: false, message: "complete your previous step" }
            }
        }
        if (status === 1 && companyTypeData.type === 'company') {
            const { contractAmount, contractTitle, workDescription, deliveryDate, creatorId, companyId } = bodyData
            const data = {
                amount: contractAmount,
                title: contractTitle,
                workDescription: workDescription,
                deliveryDate: deliveryDate,
                creator: creatorId,
                company: companyId,
                contractStatus: status
            }
            if (contractId) {
                await strapi.db.query('api::contract.contract').update({
                    where: { id: contractId },
                    data: data,
                });
                return { message: "updated" }
            } else {
                await strapi.db.query('api::contract.contract').create({
                    data: data,
                });
                return { success: true, message: "contract created" }
            }
        }
        if (status === 2 && companyTypeData.type === 'company') {
            const { campaignId } = bodyData
            console.log(campaignId === null)
            if (campaignId && contractId) {
                const data = await strapi.db.query('api::campaign.campaign').findOne({
                    where: { id: campaignId },
                    populate: { company: true },
                });
                if (data === null) {
                    return { success: false, data: "", message: "No Campaign Data With this id" }
                }
                if (data.company.id !== companyId) {
                    return { success: false, data: "", message: "Campaign Id belongs to other company" }
                }
                const campaignUpdateData = {
                    campaign: campaignId,
                    contractStatus: status
                }
                await strapi.db.query('api::contract.contract').update({
                    where: { id: contractId },
                    data: campaignUpdateData,
                });
                return { message: "Contract updated with campaignId" }
            }
            return { success: false, message: "Missing Campaign or Contract Id" }
        }
        if (status === 3 && companyTypeData.type === 'company') {
            console.log("Payment Task is pending")
        }
        if (status === 4 && companyTypeData.type === 'creator') {
            const { accepted } = bodyData
            const creatorUpdateData = {
                contractAcceptedByCreator: accepted,
                contractAcceptedByCreatorDate: new Date(),
                contractStatus: status
            }
            if (accepted) {
                await strapi.db.query('api::contract.contract').update({
                    where: { id: contractId },
                    data: creatorUpdateData,
                });
                // Notification To Send To Company
                return { success: true, message: "Contract Accepted By Creator" }
            }
            creatorUpdateData.contractStatus = 10
            delete creatorUpdateData.contractAcceptedByCreatorDate
            creatorUpdateData.cancelContractDate = new Date()
            await strapi.db.query('api::contract.contract').update({
                where: { id: contractId },
                data: creatorUpdateData,
            });
            // Notification Send to Company
            // Notification Send to Me
            return { success: true, message: "Contract Cancelled By Creator" }
        }
        if (status === 5 && companyTypeData.type === 'creator') {
            const { paymentRequestByCreator } = bodyData
            const creatorRequestData = {
                paymentRequestByCreator: paymentRequestByCreator,
                paymentRequestByCreatorDate: new Date(),
                contractStatus: status
            }
            if (paymentRequestByCreator) {
                await strapi.db.query('api::contract.contract').update({
                    where: { id: contractId },
                    data: creatorRequestData,
                });
                // Notification Send To Company
                // Notification Send To Me
                return { success: true, message: "Payment Request By Creator" }
            }
            return { success: false, message: "Missing Creator Request Data" }
        }
        if (status === 6 && companyTypeData.type === 'company') {
            const { disputeByCompany } = bodyData
            const disputeByCompanyData = {
                disputeByCompany: disputeByCompany,
                disputeDate: new Date(),
                contractStatus: 10
            }
            if (disputeByCompany) {
                await strapi.db.query('api::contract.contract').update({
                    where: { id: contractId },
                    data: disputeByCompanyData,
                });
                // Notification Send To Creator
                // Notification Send To Me
                return { success: true, message: "Dispute Raise By Company" }
            }
            return { success: false, message: "Missing Dispute Request Data" }
        }
        if (status === 7 && companyTypeData.type === 'company') {
            const { contractApproved } = bodyData
            const contractApprovedData = {
                contractApproved: contractApproved,
                contractApprovedDate: new Date(),
                contractStatus: status
            }
            if (contractApproved) {
                await strapi.db.query('api::contract.contract').update({
                    where: { id: contractId },
                    data: contractApprovedData,
                });
                // Notification Send To Creator
                // Notification Send To Me
                return { success: true, message: "Payment Release By Company" }
            }
            return { success: false, message: "Missing Contract Approved Data" }
        }
        return { success: false, message: "Missing Status Or JWT Wrong" }
    },
}));