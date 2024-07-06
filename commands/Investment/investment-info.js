const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('investment-info')
        .setDescription('Provides information about the investment system in the bot'),

    async execute(interaction) {
        const arabicButton = new ButtonBuilder()
            .setCustomId('arabic_info')
            .setLabel('نظام الاستثمار بالعربية')
            .setStyle('Primary');

        const actionRow = new ActionRowBuilder().addComponents(arabicButton);

        const englishExplanation = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Investment System')
            .setDescription(
                'The investment system allows users to invest in companies and make profits.'
            )
            .addFields(
                { name: 'Types of Investment', value: 'Investment can be made in stocks, bonds, and real estate. Each type of investment offers different risks and potential returns.' },
                { name: 'Stocks', value: 'Stocks refer to ownership shares in companies. When users invest in stocks, they purchase small portions of a specific company. Investors can earn profits through dividend distributions or an increase in the stock\'s value.' },
                { name: 'Bonds', value: 'Bonds are debt instruments issued by governments or companies to raise funds. Investors buy bonds for a certain amount, and in return, they receive a fixed interest. The value of bonds, along with the interest, is repaid after the bond\'s maturity.' },
                { name: 'Real Estate', value: 'Real estate investment involves buying or investing in properties such as houses, apartments, or land. Investors can earn profits by leasing properties to others or selling them for a higher price than they paid.' },
                { name: 'Companies', value: 'Available companies contain information about minimum and maximum salaries, and more.' },
                { name: 'Profit', value: 'Profits will be calculated based on the investment performance.' },
                { name: 'Commands', value: 'Use `/sell`, `/profit`, `/portfolio`, `/convert`, and `/invest` for managing your investments.' }
            );

        await interaction.reply({ embeds: [englishExplanation], components: [actionRow], ephemeral: true });
    },
    async interactionCreate(interaction) {
        if (interaction.isButton() && interaction.customId === 'arabic_info') {
            const arabicExplanation = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('نظام الاستثمار')
                .setDescription(
                    'يسمح نظام الاستثمار للمستخدمين بالاستثمار في الشركات وتحقيق الأرباح.'
                )
                .addFields(
                    { name: 'أنواع الاستثمار', value: 'يمكن الاستثمار في الأسهم والسندات والعقارات. كل نوع من أنواع الاستثمار يقدم مخاطر مختلفة وعوائد محتملة مختلفة.' },
                    { name: 'الأسهم', value: 'تشير الأسهم إلى حصص الملكية في الشركات. عندما يستثمر المستخدم في الأسهم، يقوم بشراء أجزاء صغيرة من شركة معينة. يمكن للمستثمرين الحصول على أرباح عبر توزيع الأرباح أو زيادة قيمة السهم.' },
                    { name: 'السندات', value: 'تشير السندات إلى أدوات دين تصدرها الحكومة أو الشركات لجمع الأموال. يقوم المستثمرون بشراء سندات مقابل مبلغ مالي، وفي المقابل يحصلون على فائدة ثابتة. يتم سداد قيمة السندات مع الفائدة بعد انتهاء مدة السند.' },
                    { name: 'العقارات', value: 'يشير الاستثمار في العقارات إلى شراء أو استثمار العقارات مثل المنازل أو الشقق أو الأراضي. يمكن للمستثمرين الحصول على أرباح من خلال تأجير العقارات للآخرين أو بيعها مقابل سعر أعلى مما دفعوا فيه.' },
                    { name: 'الشركات', value: 'تحتوي الشركات المتاحة على معلومات حول الحد الأدنى والأقصى للرواتب، وأكثر.' },
                    { name: 'الأرباح', value: 'ستتم حساب الأرباح بناءً على أداء الاستثمار.' },
                    { name: 'الأوامر', value: 'استخدم `/sell`, `/profit`, `/portfolio`, `/convert`, `/invest` لإدارة استثماراتك.' }
                );

            await interaction.reply({ embeds: [arabicExplanation], ephemeral: true });
        }
    },
};
