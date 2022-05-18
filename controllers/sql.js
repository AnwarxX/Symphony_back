const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
const e = require('cors');
const sql = require('mssql')//call for using sql module
let mssql = require('../configuration/mssql-pool-management.js')
const config = require('../configuration/config')//call for using configuration module that we create it to store database conaction
var CryptoJS = require("crypto-js");
var fs = require('fs');
const { log } = require('console');
let databaseConn=JSON.parse(fs.readFileSync('configuration/Configs.txt', 'utf8'))
let con = {
	user: databaseConn.user,
	password: databaseConn.password,
	server: databaseConn.server,
	database: "master",
	"options": {
	  "abortTransactionOnError": true,
	  "encrypt": false,
	  "enableArithAbort": true,
	  trustServerCertificate: true
	},
	charset: 'utf8'
  };
module.exports.createDatabase=async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(con)
        let request = new sql.Request(sqlPool)
        let createDatabase= await request.query(`
CREATE DATABASE [SimphonyApi]
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [SimphonyApi].[dbo].[sp_fulltext_database] @action = 'enable'
end
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET ANSI_NULL_DEFAULT OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET ANSI_NULLS OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET ANSI_PADDING OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET ANSI_WARNINGS OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET ARITHABORT OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET AUTO_CLOSE OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET AUTO_SHRINK OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET AUTO_UPDATE_STATISTICS ON 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET CURSOR_CLOSE_ON_COMMIT OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET CURSOR_DEFAULT  GLOBAL 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET CONCAT_NULL_YIELDS_NULL OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET NUMERIC_ROUNDABORT OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET QUOTED_IDENTIFIER OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET RECURSIVE_TRIGGERS OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET  DISABLE_BROKER 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET DATE_CORRELATION_OPTIMIZATION OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET TRUSTWORTHY OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET ALLOW_SNAPSHOT_ISOLATION OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET PARAMETERIZATION SIMPLE 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET READ_COMMITTED_SNAPSHOT OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET HONOR_BROKER_PRIORITY OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET RECOVERY FULL 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET  MULTI_USER 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET PAGE_VERIFY CHECKSUM  
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET DB_CHAINING OFF 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET TARGET_RECOVERY_TIME = 0 SECONDS 
`);await request.query(`
USE [SimphonyApi]
`);await request.query(`
/****** Object:  Table [dbo].[capsConfig]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[capsConfig](
	[capsCode] [int] IDENTITY(1,1) NOT NULL,
	[user] [nvarchar](50) NULL,
	[password] [nvarchar](50) NULL,
	[server] [nvarchar](50) NULL,
	[database] [nvarchar](50) NULL,
	[locRef] [nvarchar](50) NULL,
	[capsSchedule] [nvarchar](50) NULL,
	[capsScheduleStatus] [nvarchar](50) NULL,
	[name] [nvarchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[getControlDailyTotals]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getControlDailyTotals](
	[locRef] [varchar](50) NULL,
	[busDt] [date] NULL,
	[eodStatus] [int] NULL,
	[firstTransUTC] [date] NULL,
	[lastTransUTC] [date] NULL,
	[rvcNum] [int] NULL,
	[numClsdChks] [int] NULL,
	[clsdChkTtl] [float] NULL,
	[numOpnChksAtEOD] [int] NULL,
	[opnChkTtlAtEOD] [float] NULL,
	[numNonSlsTrans] [int] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getDiscountDailyTotals]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getDiscountDailyTotals](
	[locRef] [varchar](50) NULL,
	[busDt] [date] NULL,
	[rvcNum] [int] NULL,
	[dscNum] [int] NULL,
	[ttl] [float] NULL,
	[cnt] [int] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getGuestChecks]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[getGuestChecks](
	[guestCheckId] [int] NULL,
	[chkNum] [int] NULL,
	[chkName] [nvarchar](100) NULL,
	[opnBusDt] [date] NULL,
	[opnUTC] [datetime] NULL,
	[clsdBusDt] [date] NULL,
	[clsdUTC] [datetime] NULL,
	[reopnClsdChkClsdBusDt] [date] NULL,
	[reopnClsdChkClsdUTC] [datetime] NULL,
	[lastUpdatedUTC] [datetime] NULL,
	[clsdFlag] [nvarchar](10) NULL,
	[cancelFlag] [nvarchar](10) NULL,
	[gstCnt] [int] NULL,
	[subTtl] [float] NULL,
	[autoSvcTtl] [float] NULL,
	[svcChgTtl] [float] NULL,
	[taxExmpSlsTtl] [float] NULL,
	[taxCollTtl] [float] NULL,
	[chkTtl] [float] NULL,
	[dscTtl] [float] NULL,
	[payTtl] [float] NULL,
	[tipTotal] [float] NULL,
	[balDueTtl] [float] NULL,
	[rndTtl] [float] NULL,
	[reopnFrmChk] [int] NULL,
	[reopnToChk] [int] NULL,
	[spltFrmChk] [int] NULL,
	[rvcNum] [int] NULL,
	[otNum] [int] NULL,
	[tblNum] [int] NULL,
	[tblName] [nvarchar](50) NULL,
	[empNum] [int] NULL,
	[chkInfo] [nvarchar](100) NULL,
	[taxNum] [int] NULL,
	[nonTxblSlsTtl] [nvarchar](100) NULL,
	[locRef] [nvarchar](100) NULL,
	[lastUpdatedLcl] [datetime] NULL,
	[clsdLcl] [datetime] NULL,
	[opnLcl] [datetime] NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[getLocationDimensions]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getLocationDimensions](
	[locRef] [varchar](50) NULL,
	[name] [varchar](50) NULL,
	[openDt] [int] NULL,
	[active] [varchar](50) NULL,
	[srcName] [varchar](50) NULL,
	[srcVer] [varchar](50) NULL,
	[tz] [varchar](50) NULL,
	[curr] [varchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getMenuItemDimensions]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getMenuItemDimensions](
	[locRef] [varchar](50) NULL,
	[num] [int] NULL,
	[name] [varchar](50) NULL,
	[mstrNum] [int] NULL,
	[mstrName] [varchar](50) NULL,
	[name2] [varchar](50) NULL,
	[name2mstrNum] [int] NULL,
	[name2mstrName] [varchar](50) NULL,
	[majGrpNum] [int] NULL,
	[majGrpName] [varchar](50) NULL,
	[famGrpNum] [int] NULL,
	[famGrpName] [varchar](50) NULL,
	[majGrpMstrNum] [int] NULL,
	[majGrpMstrName] [varchar](50) NULL,
	[famGrpMstrNum] [int] NULL,
	[famGrpMstrName] [varchar](50) NULL,
	[doNotIncludeInSales] [varbinary](50) NULL,
	[category] [varchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getMenuItemPrices]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getMenuItemPrices](
	[locRef] [varchar](50) NULL,
	[num] [int] NULL,
	[rvcNum] [int] NULL,
	[prcLvlNum] [int] NULL,
	[prcLvlName] [varchar](50) NULL,
	[price] [float] NULL,
	[cost] [float] NULL,
	[effFrDt] [date] NULL,
	[effToDt] [date] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getRevenueCenterDimensions]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getRevenueCenterDimensions](
	[locRef] [varchar](50) NULL,
	[num] [int] NULL,
	[name] [varchar](50) NULL,
	[mstrNumNum] [int] NULL,
	[mstrNamName] [varchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getServiceChargeDailyTotals]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getServiceChargeDailyTotals](
	[locRef] [varchar](50) NULL,
	[busDt] [date] NULL,
	[rvcNum] [int] NULL,
	[svcNum] [float] NULL,
	[ttl] [float] NULL,
	[cnt] [int] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getTaxDailyTotals]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[getTaxDailyTotals](
	[locRef] [nvarchar](50) NULL,
	[busDt] [date] NULL,
	[rvcNum] [int] NULL,
	[taxNum] [int] NULL,
	[txblSlsTtl] [float] NULL,
	[taxCollTtl] [float] NULL,
	[taxExmptSlsTtl] [float] NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[getTaxDimensions]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getTaxDimensions](
	[locRef] [varchar](50) NULL,
	[num] [int] NULL,
	[name] [varchar](50) NULL,
	[mstrNum] [int] NULL,
	[mstrName] [varchar](50) NULL,
	[type] [int] NULL,
	[taxRate] [float] NULL,
	[effFrDt] [date] NULL,
	[effToDt] [date] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getTenderMediaDailyTotals]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getTenderMediaDailyTotals](
	[locRef] [varchar](50) NULL,
	[busDt] [date] NULL,
	[rvcNum] [int] NULL,
	[TendMedID] [int] NULL,
	[tmedNum] [int] NULL,
	[ttl] [float] NULL,
	[cnt] [int] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[getTenderMediaDimensions]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[getTenderMediaDimensions](
	[locRef] [varchar](50) NULL,
	[num] [int] NULL,
	[name] [varchar](50) NULL,
	[mstrNum] [int] NULL,
	[mstrName] [varchar](50) NULL,
	[type] [int] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[GuestChecksLineDetails]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[GuestChecksLineDetails](
	[guestCheckId] [int] NULL,
	[guestCheckLineItemId] [bigint] NULL,
	[lineNum] [int] NULL,
	[dtlId] [int] NULL,
	[parDtlId] [int] NULL,
	[detailUTC] [datetime] NULL,
	[busDt] [date] NULL,
	[wsNum] [int] NULL,
	[refInfo1] [varchar](50) NULL,
	[dspTtl] [float] NULL,
	[dspQty] [float] NULL,
	[aggTtl] [float] NULL,
	[aggQty] [float] NULL,
	[gross] [float] NULL,
	[doNotShowFlag] [varchar](50) NULL,
	[chkEmpNum] [int] NULL,
	[transEmpNum] [int] NULL,
	[svcRndNum] [int] NULL,
	[miNum] [int] NULL,
	[activeTaxes] [varchar](50) NULL,
	[prcLvl] [varchar](50) NULL,
	[detailType] [int] NULL,
	[detailNum] [int] NULL,
	[dscNum] [int] NULL,
	[dscMiNum] [int] NULL,
	[svcChgNum] [int] NULL,
	[tmedNum] [int] NULL,
	[errCorFlag] [varchar](50) NULL,
	[prepCost] [float] NULL,
	[weight] [float] NULL,
	[vdFlag] [varchar](50) NULL,
	[refInfo2] [varchar](50) NULL,
	[mgrEmpNum] [int] NULL,
	[rsnCodeNum] [int] NULL,
	[cashierNum] [int] NULL,
	[comboMealSeq] [int] NULL,
	[comboSideSeq] [int] NULL,
	[inclTax] [float] NULL,
	[returnFlag] [varchar](50) NULL,
	[mealEmpNum] [int] NULL,
	[vatTaxTtl] [float] NULL,
	[detailLcl] [datetime] NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[ImportStatus]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
SET ANSI_PADDING ON
`);await request.query(`
CREATE TABLE [dbo].[ImportStatus](
	[ApiName] [varchar](50) NULL,
	[Date] [date] NULL,
	[Status] [varchar](50) NULL,
	[interfaceCode] [varchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
SET ANSI_PADDING OFF
`);await request.query(`
/****** Object:  Table [dbo].[interfaceConnections]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[interfaceConnections](
	[connectionCode] [int] IDENTITY(1,1) NOT NULL,
	[type] [nvarchar](50) NULL,
	[interfaceCode] [int] NULL,
	[sunCode] [int] NULL,
	[mappCode] [nvarchar](50) NULL,
	[BUCode] [nvarchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[interfaceDefinition]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[interfaceDefinition](
	[interfaceCode] [int] IDENTITY(1,1) NOT NULL,
	[username] [nvarchar](150) NULL,
	[password] [nvarchar](200) NULL,
	[email] [nvarchar](250) NULL,
	[enterpriseShortName] [nvarchar](50) NULL,
	[clientId] [nvarchar](200) NULL,
	[lockRef] [nvarchar](50) NULL,
	[ApiSchedule] [nvarchar](50) NULL,
	[refreshToken] [nvarchar](max) NULL,
	[token] [nvarchar](max) NULL,
	[ApiScheduleStatue] [nvarchar](50) NULL,
	[name] [nvarchar](50) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[license]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[license](
	[token] [nvarchar](max) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[Mapping]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[Mapping](
	[MappingCode] [nvarchar](50) NULL,
	[MappingType] [nvarchar](100) NULL,
	[Source] [nvarchar](100) NULL,
	[locRef] [nvarchar](50) NULL,
	[RevenuCenter] [nvarchar](100) NULL,
	[Target] [nvarchar](100) NULL,
	[ALevel] [nvarchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[MappingDefinition]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[MappingDefinition](
	[MappingCode] [nvarchar](50) NULL,
	[Description] [nvarchar](250) NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[PropertySettings]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[PropertySettings](
	[BU] [nvarchar](3) NULL,
	[JournalType] [nvarchar](5) NULL,
	[Currencycode] [nvarchar](10) NULL,
	[LedgerImportDescription] [nvarchar](200) NULL,
	[SuspenseAccount] [nvarchar](15) NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  Table [dbo].[sundefinition]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE TABLE [dbo].[sundefinition](
	[SunCode] [int] IDENTITY(1,1) NOT NULL,
	[SunUser] [nvarchar](150) NULL,
	[SunPassword] [nvarchar](200) NULL,
	[Sunserver] [nvarchar](50) NULL,
	[SunDatabase] [nvarchar](50) NULL,
	[SunSchedule] [nvarchar](50) NULL,
	[SunScheduleStatue] [nvarchar](50) NULL,
	[type] [nvarchar](50) NULL,
	[name] [nvarchar](50) NULL
) ON [PRIMARY]

`);await request.query(`
/****** Object:  View [dbo].[VIEW_JV]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`




CREATE view [dbo].[VIEW_JV] as 

-- Revenue Details    
select  ltrim(Items.majGrpNum) 'Reference' ,

sum(Lines.aggTtl)*-1 'Total'  , Checks.rvcNum , Lines.busDt
from GuestChecksLineDetails Lines

left join getMenuItemDimensions as Items on Lines.miNum = Items.num
left join getGuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is not null 
group by Items.majGrpNum  , Checks.rvcNum , Lines.busDt having(sum(Lines.aggTtl) <> 0 )


union all 

-- Discount Details
select  'Discount'  ,

sum(Disc.ttl)*-1 'Total'  , Disc.rvcNum , Disc.busDt
from getDiscountDailyTotals Disc

group by Disc.rvcNum , Disc.busDt having(sum(Disc.ttl) <> 0 )


union all
-- Tender Media (Payments) Details


select Tend.name , sum(TendDtl.ttl) 'Total', TendDtl.RvcNum , TendDtl.busDt from getTenderMediaDailyTotals TendDtl 

left join getTenderMediaDimensions Tend on TendDtl.tmedNum = Tend.num

group by Tend.name, Tenddtl.rvcNum,tenddtl.busDt






---Old Tender Media Query---

--select  Tender.name  ,

--sum(Lines.aggTtl) 'Total'  , Checks.rvcNum , Lines.busDt
--from GuestChecksLineDetails Lines

--left join getMenuItemDimensions as Items on Lines.miNum = Items.num
--left join getGuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
--left join getTenderMediaDimensions Tender on Lines.tmedNum = Tender.num
--where Lines.miNum is null and 

--Lines.tmedNum is not null
--group by Tender.name  , Checks.rvcNum , Lines.busDt having(sum(Lines.aggTtl) <> 0 )


---Old Tender Media Query---

union all
-- Service Charge Details
select  'Service Charge'  ,

sum(svc.ttl) *-1'Total'  , svc.rvcNum , svc.busDt
from getServiceChargeDailyTotals svc

group by  svc.rvcNum , svc.busDt having(sum(svc.ttl) <> 0 )


union all 

-- VAT Details
select Tx.name ,sum(TxDaily.taxCollTtl) *-1 'VAT' , TxDaily.rvcNum ,TxDaily.busDt
from getTaxDailyTotals TxDaily

left join getTaxDimensions Tx on Tx.num = TxDaily.taxNum

group by Tx.name,TxDaily.rvcNum ,TxDaily.busDt having(sum(TxDaily.taxCollTtl) <> 0 )





`);await request.query(`
/****** Object:  View [dbo].[VIEW_JV_NET]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`





CREATE view [dbo].[VIEW_JV_NET] as 

-- Revenue Details    
select  ltrim(Items.majGrpNum) 'Reference' ,

sum(Lines.gross)*-1 'Total'  , Checks.rvcNum , Lines.busDt
from GuestChecksLineDetails Lines

left join getMenuItemDimensions as Items on Lines.miNum = Items.num
left join getGuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is not null 
group by Items.majGrpNum  , Checks.rvcNum , Lines.busDt having(sum(Lines.gross) <> 0 )


union all 

-- Tender Media (Payments) Details


select Tend.name , sum(TendDtl.ttl) 'Total', TendDtl.RvcNum , TendDtl.busDt from getTenderMediaDailyTotals TendDtl 

left join getTenderMediaDimensions Tend on TendDtl.tmedNum = Tend.num

group by Tend.name, Tenddtl.rvcNum,tenddtl.busDt



---Old Tender Media Query---

--select  Tender.name  ,

--sum(Lines.aggTtl) 'Total'  , Checks.rvcNum , Lines.busDt
--from GuestChecksLineDetails Lines

--left join getMenuItemDimensions as Items on Lines.miNum = Items.num
--left join getGuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
--left join getTenderMediaDimensions Tender on Lines.tmedNum = Tender.num
--where Lines.miNum is null and 

--Lines.tmedNum is not null
--group by Tender.name  , Checks.rvcNum , Lines.busDt having(sum(Lines.aggTtl) <> 0 )


---Old Tender Media Query---

union all
-- Service Charge Details
select  'Service Charge'  ,

sum(svc.ttl) *-1'Total'  , svc.rvcNum , svc.busDt
from getServiceChargeDailyTotals svc

group by  svc.rvcNum , svc.busDt having(sum(svc.ttl) <> 0 )


union all 

-- VAT Details
select Tx.name ,sum(TxDaily.taxCollTtl) *-1 'VAT' , TxDaily.rvcNum ,TxDaily.busDt
from getTaxDailyTotals TxDaily

left join getTaxDimensions Tx on Tx.num = TxDaily.taxNum

group by Tx.name,TxDaily.rvcNum ,TxDaily.busDt having(sum(TxDaily.taxCollTtl) <> 0 )






`);await request.query(`
/****** Object:  View [dbo].[VIEW_JV_MAIN_NET]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`

CREATE view [dbo].[VIEW_JV_MAIN_NET] as select s1.Reference,s1.Total,s1.rvcNum,s1.busDt from VIEW_JV_NET s1
union all 
select 'Clearance' , format(-sum(Total),'0.00#.##')  , '' , busDt from VIEW_JV
group by busDt


`);await request.query(`
/****** Object:  View [dbo].[VIEW_JV_MAIN]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE view [dbo].[VIEW_JV_MAIN] as select s1.Reference,s1.Total,s1.rvcNum,s1.busDt from VIEW_JV s1
union all 
select 'Clearance' , format(-sum(Total),'0.00#.##')  , '' , busDt from VIEW_JV
group by busDt

`);await request.query(`
/****** Object:  View [dbo].[View_JV_1]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`

CREATE view [dbo].[View_JV_1] as 

select Main.Account , Main.Reference , Main.Total , Main.rvcNum ,Main.TransactionDate, Main.Period , isnull(T01.Target,'#') 'T01' , isnull(T02.Target,'#') 'T02' 
  ,isnull(T03.Target,'#') 'T03'
  ,isnull(T04.Target,'#') 'T04'
 ,isnull(T05.Target,'#') 'T05'
 ,isnull(T06.Target,'#') 'T06'
 ,isnull(T07.Target,'#') 'T07'
 ,isnull(T08.Target,'#') 'T08'
 ,isnull(T09.Target,'#') 'T09'
 ,isnull(T10.Target,'#') 'T10'
 
  from 
(select Main.Reference , Acc.Target 'Account', sum(Main.Total) 'Total', Main.rvcNum , Main.busDt 'TransactionDate' , ltrim(Year(Main.busDt))+RIGHT('000'+ ltrim(MONTH(Main.busDt)),3) 'Period' from VIEW_JV_MAIN Main
left join Mapping Acc on Main.Reference = Acc.Source and Acc.MappingType = 'Account'

where Main.busDt = '2022-02-05'
group by Main.Reference,Main.rvcNum , Main.busDt , Acc.Target
) as Main

left join Mapping as T01 on Main.Reference = T01.Source and Main.rvcNum = T01.RevenuCenter and T01.ALevel = 1
left join Mapping as T02 on Main.Reference = T02.Source and Main.rvcNum = T02.RevenuCenter and T02.ALevel =  2  
left join Mapping as T03 on Main.Reference = T03.Source and Main.rvcNum = T03.RevenuCenter and T03.ALevel =  3  
left join Mapping as T04 on Main.Reference = T04.Source and Main.rvcNum = T04.RevenuCenter and T04.ALevel =  4  
left join Mapping as T05 on Main.Reference = T05.Source and Main.rvcNum = T05.RevenuCenter and T05.ALevel =  5  
left join Mapping as T06 on Main.Reference = T06.Source and Main.rvcNum = T06.RevenuCenter and T06.ALevel =  6  
left join Mapping as T07 on Main.Reference = T07.Source and Main.rvcNum = T07.RevenuCenter and T07.ALevel =  7  
left join Mapping as T08 on Main.Reference = T08.Source and Main.rvcNum = T08.RevenuCenter and T08.ALevel =  8  
left join Mapping as T09 on Main.Reference = T09.Source and Main.rvcNum = T09.RevenuCenter and T09.ALevel =  9  
left join Mapping as T10 on Main.Reference = T10.Source and Main.rvcNum = T10.RevenuCenter and T10.ALevel =  10  






`);await request.query(`
/****** Object:  StoredProcedure [dbo].[SP_JV]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`




-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_JV]
	-- Add the parameters for the stored procedure here
	@Date datetime 
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

-- Revenue Details    
select  ltrim(Items.majGrpNum) 'Reference' ,

sum(Lines.aggTtl)*-1 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is not null and Lines.busDt = @Date
group by Items.majGrpNum  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all 

-- Discount Details
select  'Discount'  ,

sum(Disc.ttl)*-1 'Total'  , Disc.rvcNum
from DiscountDailyTotals Disc
where  
Disc.busDt = @Date 
group by Disc.rvcNum having(sum(Disc.ttl) <> 0 )


union all
-- Tender Media (Payments) Details
select  Tender.name  ,

sum(Lines.aggTtl) 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
left join TenderMedia Tender on Lines.tmedNum = Tender.num
where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.tmedNum is not null
group by Tender.name  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all
-- Service Charge Details
select  'Service Charge'  ,

sum(svc.ttl) *-1'Total'  , svc.rvcNum
from ServiceChargeDailyTotals svc



where svc.busDt = @Date 
group by  svc.rvcNum having(sum(svc.ttl) <> 0 )


union all 

select Tx.name ,sum(TxDaily.taxCollTtl) *-1 'VAT' , TxDaily.rvcNum from TaxDailyTotals TxDaily

left join Taxes Tx on Tx.num = TxDaily.taxNum
where TxDaily.busDt = @Date
group by Tx.name,TxDaily.rvcNum having(sum(TxDaily.taxCollTtl) <> 0 )

END





`);await request.query(`
/****** Object:  StoredProcedure [dbo].[SP_SYMPHONY_REVENUE]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`



-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_SYMPHONY_REVENUE]
	-- Add the parameters for the stored procedure here
	@Date datetime 
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

-- Revenue Details    
select  ltrim(Items.majGrpNum) 'Reference' ,

sum(Lines.aggTtl)*-1 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is not null and Lines.busDt = @Date
group by Items.majGrpNum  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all 

-- Discount Details
select  'Discount'  ,

sum(Lines.aggTtl)*-1 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.dscMiNum is not null 
group by Items.majGrpNum  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all
-- Tender Media (Payments) Details
select  Tender.name  ,

sum(Lines.aggTtl) 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
left join TenderMedia Tender on Lines.tmedNum = Tender.num
where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.tmedNum is not null
group by Tender.name  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all
-- Service Charge Details
select  'Service Charge'  ,

sum(Lines.aggTtl) *-1'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines


left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId

where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.svcChgNum is not null
group by  Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all 

select 'VAT', isnull(sum(VAT),0) *-1 'VAT' , rvcNum from (
select Checks.guestCheckId , Checks.subTtl , sum(Lines.aggTtl) 'ServiceCharge'  , (Checks.subTtl + sum(Lines.aggTtl) ) *0.14 'VAT' , Checks.rvcNum from GuestChecks Checks 
left join GuestChecksLineDetails Lines on Lines.guestCheckId = Checks.guestCheckId and Lines.svcChgNum is not null

where Checks.clsdBusDt = @Date

group by Checks.guestCheckId,Checks.subTtl , Checks.rvcNum )
as Data 
group by Data.rvcNum having(sum(VAT) <> 0 )

END




`);await request.query(`
/****** Object:  StoredProcedure [dbo].[SP_SYMPHONY_REVENUE_PER_CHECK]    Script Date: 17/05/2022 8:37:12 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`




-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE PROCEDURE [dbo].[SP_SYMPHONY_REVENUE_PER_CHECK]
	-- Add the parameters for the stored procedure here
	@Date datetime ,
	@CheckNo int
	
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

-- Revenue Details    
select  ltrim(Items.majGrpNum) 'Reference' ,

sum(Lines.aggTtl)*-1 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is not null and Lines.busDt = @Date
and Checks.chkNum = @CheckNo
group by Items.majGrpNum  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all 

-- Discount Details
select  'Discount'  ,

sum(Lines.aggTtl)*-1 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.dscMiNum is not null 
and Checks.chkNum = @CheckNo
group by Items.majGrpNum  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all
-- Tender Media (Payments) Details
select  Tender.name  ,

sum(Lines.aggTtl) 'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines

left join MenuItems as Items on Lines.miNum = Items.num
left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId
left join TenderMedia Tender on Lines.tmedNum = Tender.num
where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.tmedNum is not null
and Checks.chkNum = @CheckNo
group by Tender.name  , Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all
-- Service Charge Details
select  'Service Charge'  ,

sum(Lines.aggTtl) *-1'Total'  , Checks.rvcNum
from GuestChecksLineDetails Lines


left join GuestChecks as Checks on Lines.guestCheckId = Checks.guestCheckId

where Lines.miNum is null and 
Lines.busDt = @Date  and 
Lines.svcChgNum is not null
and Checks.chkNum = @CheckNo
group by  Checks.rvcNum having(sum(Lines.aggTtl) <> 0 )


union all 

select 'VAT', isnull(sum(VAT),0) *-1 'VAT' , rvcNum from (
select Checks.guestCheckId , Checks.subTtl , sum(Lines.aggTtl) 'ServiceCharge'  , (Checks.subTtl + sum(Lines.aggTtl) ) *0.14 'VAT' , Checks.rvcNum from GuestChecks Checks 
left join GuestChecksLineDetails Lines on Lines.guestCheckId = Checks.guestCheckId and Lines.svcChgNum is not null

where Checks.clsdBusDt = @Date
and Checks.chkNum = @CheckNo
group by Checks.guestCheckId,Checks.subTtl , Checks.rvcNum )
as Data 
group by Data.rvcNum having(sum(VAT) <> 0 )

END





`);await request.query(`
USE [master]
`);await request.query(`
ALTER DATABASE [SimphonyApi] SET  READ_WRITE 
`); 
         
		
        console.log(createDatabase);
		

        res.json("Database created successfully")
        // if(createDatabase.recordset==undefined){
          
        //     res.json('Submitted ')
        // }
        // else
        //     res.json("Already exist")
        
    }
    catch (error) {
        res.json(error.message)
    }

}
module.exports.createViews=async (req, res) => {
    try {
        let sqlPool = await mssql.GetCreateIfNotExistPool(con)
        let request = new sql.Request(sqlPool)
        let createViews= await request.query(`
		USE [CheckPostingDB]
`);await request.query(`
/****** Object:  View [dbo].[V_Check_DSC_Tax]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`










CREATE view [dbo].[V_Check_DSC_Tax] as
SELECT CheckDetailID, DscntDetailLink, ItemDetailLink, Amount, IncludesMITax, SubItem,
 InclusiveTax, DscntAllocDtlID,
 (select max(substring( DISCOUNT_DETAIL.optionbits,11,1)) from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID)) as SCHG,
 (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,1,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,1,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX1,
 (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,2,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,2,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX2,
  (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,3,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,3,1)) end from discount_detail where(left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX3,
   (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,4,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,4,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX4,
    (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,5,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,5,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX5,
     (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,6,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,6,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX6,
      (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,7,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,7,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID)) as TAX7,
       (select case when MAX(substring( DISCOUNT_DETAIL.TaxRates,8,1)) ='' then 0 else max(substring( DISCOUNT_DETAIL.TaxRates,8,1)) end from discount_detail where (left( DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))=left(discount_detail.CheckDetailID,(len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)-3))) and len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(discount_detail.CheckDetailID))  as TAX8
 FROM  DISCOUNT_ALLOC_DETAIL




`);await request.query(`
/****** Object:  View [dbo].[V_MI_NAME_GRP]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`


CREATE view [dbo].[V_MI_NAME_GRP] as
SELECT MENU_ITEM_DETAIL.CheckDetailID, MENU_ITEM_DETAIL.MenuItemDefID, MENU_ITEM_DEFINITION.Name1ID, MENU_ITEM_MASTER.ObjectNumber, MENU_ITEM_MASTER.MajGrpObjNum, MENU_ITEM_MASTER.FAMGRPOBJNUM, 
               STRING_TABLE.StringText
FROM  MENU_ITEM_DETAIL INNER JOIN
               MENU_ITEM_DEFINITION ON MENU_ITEM_DETAIL.MenuItemDefID = MENU_ITEM_DEFINITION.MenuItemDefID INNER JOIN
               MENU_ITEM_MASTER ON MENU_ITEM_DEFINITION.MenuItemMasterID = MENU_ITEM_MASTER.MenuItemMasterID INNER JOIN
               STRING_TABLE ON MENU_ITEM_DEFINITION.Name1ID = STRING_TABLE.StringNumberID

`);await request.query(`
/****** Object:  View [dbo].[V_Check_DTL_Sky]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
create view [dbo].[V_Check_DTL_Sky]
as 
SELECT  [CheckPostingDB].[dbo].CHECK_DETAIL.CheckID, DetailIndex,
 DetailType,
  Seat,  SalesCount,[MajGrpObjNum],[FAMGrpObjNum],[StringText],
   Total, VoidLink, Numerator, Denominator,
    StoredValueCardID, StoredValueCardType,
     DetailPostingTime, CheckClose,DetailLink
       , ParentDetailLink,
                 CHECK_DETAIL.CheckDetailID, 
                 GuestCount,CHECK_DETAIL.ObjectNumber
   ,( Select  sum (Amount)from DISCOUNT_ALLOC_DETAIL
     where (left(check_detail.CheckDetailID,(len(check_detail.CheckDetailID)-3))=
	 left(DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(check_detail.CheckDetailID)-3)) and 
	 len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(check_detail.CheckDetailID)
			   and CHECK_DETAIL.DetailLink = DISCOUNT_ALLOC_DETAIL.ItemDetailLink) 
			   group by DISCOUNT_ALLOC_DETAIL.ItemDetailLink)
			   
			   as Discount, 
			   (select max(objectnumber) from check_detail where (checkid=check_detail.checkid and detailtype=4)) as PAY,


			   
			   
    ( Select  MAX([CheckDetailID] ) from [CheckPostingDB].[dbo].[V_Check_DSC_Tax] 
where (left(check_detail.CheckDetailID,(len(check_detail.CheckDetailID)-3))=left([CheckPostingDB].[dbo].[V_Check_DSC_Tax].
CheckDetailID,(len(check_detail.CheckDetailID)-3))and len(check_detail.CheckDetailID)=len([V_Check_DSC_Tax].CheckDetailID))
			     and ([CheckPostingDB].[dbo].[V_Check_DSC_Tax]. [ItemDetailLink] = check_detail.detaillink) 
group by ItemDetailLink ) as DSC_ID
FROM  CHECK_DETAIL

left join  [CheckPostingDB].[dbo].[CHECKS] on  [CheckPostingDB].[dbo].CHECK_DETAIL.CheckID=[CheckPostingDB].[dbo].[CHECKS].CheckID
left join [V_MI_NAME_GRP] on [CheckPostingDB].[dbo].CHECK_DETAIL.CheckDetailID=[V_MI_NAME_GRP].CheckDetailID
where [CheckPostingDB].[dbo].[CHECKS].CheckID=103570    and [StringText] is not null

`);await request.query(`
/****** Object:  View [dbo].[CHECK_DTL_ITEM_DSC]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`

CREATE View [dbo].[CHECK_DTL_ITEM_DSC] as
SELECT CheckID, DetailIndex,
 DetailType,
  Seat, RevCtrID, EmployeeID, SalesCount,
   Total, VoidLink, Numerator, Denominator,
    StoredValueCardID, StoredValueCardType,
     DetailPostingTime, DetailLink,
       TaxForgivenTotal, ParentDetailLink,
                RoundNumber, CheckDetailID, KdsDetailLink, 
                KdsOrderID, GuestCount, ObjectNumber, OwnerDetailLink, Status
   ,( Select suM( Amount)  from DISCOUNT_ALLOC_DETAIL
     where (left(check_detail.CheckDetailID,(len(check_detail.CheckDetailID)-3))=left(DISCOUNT_ALLOC_DETAIL.CheckDetailID,(len(check_detail.CheckDetailID)-3)) and  len(DISCOUNT_ALLOC_DETAIL.CheckDetailID)=len(check_detail.CheckDetailID)
			   and CHECK_DETAIL.DetailLink = DISCOUNT_ALLOC_DETAIL.ItemDetailLink) 
			   group by DISCOUNT_ALLOC_DETAIL.ItemDetailLink)
			   
			   as Discount,
			   
    ( Select  MAX([CheckDetailID] ) from [CheckPostingDB].[dbo].[V_Check_DSC_Tax] 
where (left(check_detail.CheckDetailID,(len(check_detail.CheckDetailID)-3))=left([CheckPostingDB].[dbo].[V_Check_DSC_Tax].CheckDetailID,(len(check_detail.CheckDetailID)-3))and len(check_detail.CheckDetailID)=len([V_Check_DSC_Tax].CheckDetailID))
			     and ([CheckPostingDB].[dbo].[V_Check_DSC_Tax]. [ItemDetailLink] = check_detail.detaillink) 
group by ItemDetailLink ) as DSC_ID
FROM  CHECK_DETAIL


`);await request.query(`
/****** Object:  View [dbo].[V_Hier]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE   view [dbo].[V_Hier] as
SELECT PROPERTY.PropertyID, V_HIERARCHY.HierStrucID
FROM  PROPERTY INNER JOIN
               V_HIERARCHY ON PROPERTY.PropertyID = V_HIERARCHY.PropertyID

`);await request.query(`
/****** Object:  View [dbo].[V_CHECK_MI_TAX]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`



CREATE View [dbo].[V_CHECK_MI_TAX] as
SELECT CHECK_DETAIL.CheckDetailID, CHECK_DETAIL.CheckID, CHECK_DETAIL.DetailType, CHECK_DETAIL.DetailIndex, CHECK_DETAIL.SalesCount, CHECK_DETAIL.Total, 
               CHECK_DETAIL.RevCtrID, CHECK_DETAIL.ObjectNumber, MENU_ITEM_DETAIL.MenuItemDefID, MENU_ITEM_DETAIL.DscntItmzrID, MENU_ITEM_DETAIL.SvcChgItmzrID, 
               MENU_ITEM_DETAIL.SlsItmzrIndex,
              case when substring( MENU_ITEM_DETAIL.TaxRates,1,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,1,1) end as TAX1,
              case when substring( MENU_ITEM_DETAIL.TaxRates,2,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,2,1) end as TAX2,
              case when substring( MENU_ITEM_DETAIL.TaxRates,3,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,3,1) end as TAX3,
              case when substring( MENU_ITEM_DETAIL.TaxRates,4,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,4,1) end as TAX4,
              case when substring( MENU_ITEM_DETAIL.TaxRates,5,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,5,1) end as TAX5,
              case when substring( MENU_ITEM_DETAIL.TaxRates,6,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,6,1) end as TAX6,
              case when substring( MENU_ITEM_DETAIL.TaxRates,7,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,7,1) end as TAX7,
              case when substring( MENU_ITEM_DETAIL.TaxRates,8,1)='' then 0 else substring( MENU_ITEM_DETAIL.TaxRates,8,1) end as TAX8,
               
               MENU_ITEM_DETAIL.MenuItemDtlID,
               (select menuitemclassobjnum from [MENU_ITEM_DEFINITION] where MENU_ITEM_DETAIL.MenuItemDefID=MENU_ITEM_DEFINITION.MenuItemDefID) as CLASS_NUM,
               (select substring(optionbits,12,1) from [MENU_ITEM_CLASS] where ((select menuitemclassobjnum from [MENU_ITEM_DEFINITION] where MENU_ITEM_DETAIL.MenuItemDefID=MENU_ITEM_DEFINITION.MenuItemDefID) = menu_ITEM_CLASS.objectnumber)  and Menu_item_class.hierstrucID= (select hierstrucid from V_hier)) as SCHG_CLASS
FROM  CHECK_DETAIL INNER JOIN
               MENU_ITEM_DETAIL ON CHECK_DETAIL.CheckDetailID = MENU_ITEM_DETAIL.CheckDetailID
WHERE (CHECK_DETAIL.DetailType = 1)







`);await request.query(`
/****** Object:  View [dbo].[V_CHK_ORDTYPE]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`

create view [dbo].[V_CHK_ORDTYPE] as
SELECT CHECKS.CheckID, ORDER_TYPE.OrdTypeID, ORDER_TYPE_PARAMETER.OrdTypeIndex
FROM  CHECKS INNER JOIN
               ORDER_TYPE ON CHECKS.OrdTypeID = ORDER_TYPE.OrdTypeID INNER JOIN
               ORDER_TYPE_PARAMETER ON ORDER_TYPE.HierStrucID = ORDER_TYPE_PARAMETER.HierStrucID AND ORDER_TYPE.OrdTypeIndex = ORDER_TYPE_PARAMETER.OrdTypeIndex

`);await request.query(`
/****** Object:  View [dbo].[V_CHK_ORD_Tax]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`








CREATE view [dbo].[V_CHK_ORD_Tax] as
SELECT Max( CHECKS.CheckID) as CheckID,Max( CHECKS.CheckNumber) as Checknumber,max(checks.ordtypeID) as ordtypeID,max(ORDER_TYPE.ordtypeIndex) as ordtypeIndex,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,1,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax1,(select max(taxtype) from tax where taxindex=1 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T1,(select max(Percentage) from tax where taxindex=1) as TAX_P1,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,2,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax2,(select max(taxtype) from tax where taxindex=2 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T2,(select max(Percentage) from tax where taxindex=2) as TAX_P2,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,3,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax3,(select max(taxtype) from tax where taxindex=3 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T3,(select max(Percentage) from tax where taxindex=3) as TAX_P3,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,4,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax4,(select max(taxtype) from tax where taxindex=4 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T4,(select max(Percentage) from tax where taxindex=4) as TAX_P4,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,5,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax5,(select max(taxtype) from tax where taxindex=5 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T5,(select max(Percentage) from tax where taxindex=5) as TAX_P5,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,6,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax6,(select max(taxtype) from tax where taxindex=6 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T6,(select max(Percentage) from tax where taxindex=6) as TAX_P6,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,7,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax7,(select max(taxtype) from tax where taxindex=7 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T7,(select max(Percentage) from tax where taxindex=7) as TAX_P7,
(select (Max(substring( ORDER_TYPE_PARAMETER.TaxMask,8,1)))from ORDER_TYPE_PARAMETER where Ordtypeindex=(select ordtypeindex from [V_CHK_ORDTYPE] where Max(checks.checkID)=V_CHK_ORDTYPE.checkID) and hierstrucID= (select max(hierstrucID) from v_hier)) as Tax8,(select max(taxtype) from tax where taxindex=8 and HierStrucID = (select [HierStrucID] from V_HIer)) as TAX_T8,(select max(Percentage) from tax where taxindex=8) as TAX_P8
FROM  CHECKS INNER JOIN
               ORDER_TYPE ON CHECKS.OrdTypeID = ORDER_TYPE.OrdTypeID INNER JOIN
               ORDER_TYPE_PARAMETER ON ORDER_TYPE.OrdTypeIndex = ORDER_TYPE_PARAMETER.OrdTypeIndex
group by checkid







`);await request.query(`
/****** Object:  View [dbo].[V_TAX_CLASS]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`

CREATE view [dbo].[V_TAX_CLASS] as
SELECT TAX_CLASS.ObjectNumber , TAX_CLASS.hierstrucID,TAX_CLASS_TAX.TaxClassID, TAX_CLASS_TAX.TaxIndex, TAX_CLASS_TAX.TaxClassTaxID, TAX.Percentage, TAX.TaxType, 1 as TT
FROM  TAX_CLASS INNER JOIN
               TAX_CLASS_TAX ON TAX_CLASS.TaxClassID = TAX_CLASS_TAX.TaxClassID INNER JOIN
               TAX ON TAX_CLASS_TAX.TaxIndex = TAX.TaxIndex
WHERE (TAX.Percentage <> 0) and TAX_CLASS.hierstrucID= (select MAx(hierstrucID) from V_hier)
and TAX_CLASS.hierstrucID=(select Max(hierstrucID) from V_HIer)
and TAX_CLASS_TAX.hierstrucID=(select Max(hierstrucID) from V_HIer)
and TAX.hierstrucID=(select Max(hierstrucID) from V_HIer)




`);await request.query(`
/****** Object:  View [dbo].[V_SVC_CHG]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`




CREATE view [dbo].[V_SVC_CHG] as
SELECT T_RVC_SCHG.RVC_Num,(select [RevCtrID] from [REVENUE_CENTER] where T_RVC_SCHG.RVC_Num=[REVENUE_CENTER].[ObjectNumber]) as [RevCtrID] , SERVICE_CHARGE.ObjectNumber, SERVICE_CHARGE.Percentage, SERVICE_CHARGE.TaxClassObjNum,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=1 ) as TAX1,
  (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=1 ) as TAXType1,
  1 as flag,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=1 ) as TAXTP1,
  
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=2 ) as TAX2,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=2 ) as TAXType2,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=2) as TAXTP2,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=3 ) as TAX3,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=3 ) as TAXType3,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=3 ) as TAXTP3,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=4 ) as TAX4,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=4 ) as TAXType4,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=4 ) as TAXTP4,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=5 ) as TAX5,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=5 ) as TAXType5,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=5 ) as TAXTP5,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=6 ) as TAX6,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=6 ) as TAXType6,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=6 ) as TAXTP6,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=7 ) as TAX7,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=7) as TAXType7,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=7 ) as TAXTP7,
  (select 1 from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=8 ) as TAX8,
   (select taxtype from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=8 ) as TAXType8,
  (select [Percentage] from V_TAX_CLASS where SERVICE_CHARGE.TaxClassObjNum=V_TAX_CLASS.ObjectNumber and V_TAX_CLASS.Taxindex=8 ) as TAXTP8

FROM  T_RVC_SCHG INNER JOIN
               SERVICE_CHARGE ON T_RVC_SCHG.AutoSVC = SERVICE_CHARGE.ObjectNumber


`);await request.query(`
/****** Object:  View [dbo].[V_CHECK_DTL_B_FINAL]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`









CREATE view [dbo].[V_CHECK_DTL_B_FINAL] as
SELECT CheckID, DetailType, RevCtrID, ObjectNumber, SalesCount, Total, CheckDetailID, ISNULL(Discount, 0) AS Discount, DSC_ID
,total*(select [Percentage] from [CheckPostingDB].[dbo].[V_SVC_CHG] where CHECK_DTL_ITEM_DSC.[RevCtrID]= [CheckPostingDB].[dbo].[V_SVC_CHG].[RevCtrID]) as Schg
,discount * (select flag from [CheckPostingDB].[dbo].[V_SVC_CHG] where CHECK_DTL_ITEM_DSC.[RevCtrID]= [CheckPostingDB].[dbo].[V_SVC_CHG].[RevCtrID])*(select IsNULL(schg,0) from [CheckPostingDB].[dbo].[V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID = [CheckPostingDB].[dbo].[V_Check_DSC_Tax].[CheckDetailID]) and [V_Check_DSC_Tax].[ItemDetailLink]= CHECK_DTL_ITEM_DSC.detaillink)*(select [Percentage] from [CheckPostingDB].[dbo].[V_SVC_CHG] where CHECK_DTL_ITEM_DSC.[RevCtrID]= [CheckPostingDB].[dbo].[V_SVC_CHG].[RevCtrID]) as DSC_Schg
,total*(select tax1 from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.checkdetailid=[V_CHECK_MI_TAX].[CheckDetailID]) as tax1
,(select  case when (tax_T1 = 0) then 0 else tax1*tax_p1 end from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT1,
(select   case when (tax_T2 = 0) then 0 else tax2*tax_p2 end from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT2,
(select  case when (tax_T3 = 0) then 0 else tax3*tax_p3 end from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT3,
(select  case when (tax_T4 = 0) then 0 else tax4*tax_p4 end from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT4,
(select  case when (tax_T5 = 0) then 0 else tax5*tax_p5 end  from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT5,
(select  case when (tax_T6 = 0) then 0 else tax6*tax_p6 end  from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT6,
(select  case when (tax_T7 = 0) then 0 else tax7*tax_p7 end from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT7,
(select  case when (tax_T8 = 0) then 0 else tax8*tax_p8 end  from [V_CHK_ORD_Tax] where CHECK_DTL_ITEM_DSC.CheckID=[V_CHK_ORD_Tax].CheckID)as TAXOT8,
( Select  isnull(tax1,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI1,
( Select isnull(tax2,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI2,
( Select isnull(tax3,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI3,
( Select isnull(tax4,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI4,
( Select isnull(tax5,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI5,
( Select isnull(tax6,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI6,
( Select isnull(tax7,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI7,
( Select isnull(tax8,0) from [V_CHECK_MI_TAX] where CHECK_DTL_ITEM_DSC.CheckDetailID=[V_CHECK_MI_TAX].CheckDetailID)as TAXI8,
( Select  isnull(tax1,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD1,
( Select  isnull(tax2,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD2,
( Select  isnull(tax3,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD3,
( Select  isnull(tax4,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD4,
( Select  isnull(tax5,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD5,
( Select  isnull(tax6,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD6,
( Select  isnull(tax7,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD7,
( Select  isnull(tax8,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXD8,


( Select  isnull(tax1,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax2,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax3,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax4,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax5,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax6,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax7,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)+
( Select  isnull(tax8,0) from [V_Check_DSC_Tax] where (CHECK_DTL_ITEM_DSC.DSC_ID=[V_Check_DSC_Tax].CheckDetailID) and CHECK_DTL_ITEM_DSC.detaillink=[V_Check_DSC_Tax].itemdetaillink)as TAXDTTL,


( Select  isnull(tax1,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC1,
( Select  isnull(tax2,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC2,
( Select  isnull(tax3,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC3,
( Select  isnull(tax4,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC4,
( Select  isnull(tax5,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC5,
( Select  isnull(tax6,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC6,
( Select  isnull(tax7,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC7,
( Select  isnull(tax8,0) from [V_SVC_CHG] where (CHECK_DTL_ITEM_DSC.revctrid=[V_SVC_CHG].revctrid)) as TAXC8,
(select max(objectnumber) from check_detail where (CHECK_DTL_ITEM_DSC.checkid=check_detail.checkid and detailtype=4)) as PAY






FROM  CHECK_DTL_ITEM_DSC
WHERE (DetailType = 1)






`);await request.query(`
/****** Object:  View [dbo].[V_EI_tender]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CReate view [dbo].[V_EI_tender]
as

SELECT     dbo.TENDER_MEDIA.ObjectNumber, dbo.STRING_TABLE.StringText, dbo.TENDER_MEDIA.HierStrucID
FROM        dbo.TENDER_MEDIA INNER JOIN
                  dbo.STRING_TABLE ON dbo.TENDER_MEDIA.NameID = dbo.STRING_TABLE.StringNumberID

`);await request.query(`
/****** Object:  View [dbo].[CHECK_DTL_FINAL]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`




CREATE view [dbo].[CHECK_DTL_FINAL] as
SELECT V_CHECK_DTL_B_FINAL.CheckID, CHECKS.CheckNumber, CHECKS.CheckClose, checks.CheckOpen,checks.alternateid,REVENUE_CENTER.ObjectNumber,[CheckDetailID], V_CHECK_DTL_B_FINAL.ObjectNumber AS MENUITEMID,
(select [MajGrpObjNum] from [V_MI_NAME_GRP] where  V_CHECK_DTL_B_FINAL.[CheckDetailID] = [V_MI_NAME_GRP].[CheckDetailID]) as MAJGRP,
(select [FAMGrpObjNum] from [V_MI_NAME_GRP] where  V_CHECK_DTL_B_FINAL.[CheckDetailID] = [V_MI_NAME_GRP].[CheckDetailID]) as FAMGRP,
(select [StringText] from [V_MI_NAME_GRP] where  V_CHECK_DTL_B_FINAL.[CheckDetailID] = [V_MI_NAME_GRP].[CheckDetailID]) as NAME,
               V_CHECK_DTL_B_FINAL.SalesCount, V_CHECK_DTL_B_FINAL.Total as Gross_B_DSC, V_CHECK_DTL_B_FINAL.RevCtrID,
              case when  V_CHECK_DTL_B_FINAL.taxdttl = 0 then 'F'  
               when V_CHECK_DTL_B_FINAL.taxdttl is  NULL then  'F' else 'T' end as DSC_AFT_TAX,

               
               V_CHECK_DTL_B_FINAL.Discount,(V_CHECK_DTL_B_FINAL.Total - V_CHECK_DTL_B_FINAL.Discount)  as Gross_A_DSC, ISNULL(V_CHECK_DTL_B_FINAL.Schg,0) - ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0) 
               AS SCHG,
                    (V_CHECK_DTL_B_FINAL.Total - V_CHECK_DTL_B_FINAL.Discount)- 
                     (case
               when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot1+1,0)))*ISNULL(taxi1,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot1+1,0)))* ISNULL(taxi1,0)* ISNULL(taxd1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
               else 0.00
               end
               +
               case
               when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot2+1,0)))*ISNULL(taxi2,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot2+1,0)))* ISNULL(taxi2,0)* ISNULL(taxd2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
               else 0.00
               end
               +
                case
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot3+1,0)))*ISNULL(taxi3,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot3+1,0)))* ISNULL(taxi3,0)* ISNULL(taxd3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
               else 0.00
               end
               +
               case
                when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot4+1,0)))*ISNULL(taxi4,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot4+1,0)))* ISNULL(taxi4,0)* ISNULL(taxd4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
                 else 0.00
               end
                +
                case
                when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot5+1,0)))*ISNULL(taxi5,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot5+1,0)))* ISNULL(taxi5,0)* ISNULL(taxd5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
                 else 0.00
               end
               +
               case
                when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot6+1,0)))*ISNULL(taxi6,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot6+1,0)))* ISNULL(taxi6,0)* ISNULL(taxd6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
                else 0.00
               end
               +
               case
                when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                   ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot7+1,0)))*ISNULL(taxi7,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot7+1,0)))* ISNULL(taxi7,0)* ISNULL(taxd7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) )
                else 0.00
               end
               +
               case
                when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ( (IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot8+1,0)))*ISNULL(taxi8,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot8+1,0)))* ISNULL(taxi8,0)* ISNULL(taxd8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
                 else 0.00
               end
                ) 
               
               as NET_A_DSC,
               (select taxcode1 from T_TAX_CODE) as T1_Code,
               case 
                when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
                (IsNULL(total,0)*ISNULL(taxot1,0)*ISNULL(taxi1,0)- ISNULL(discount,0)*ISNULL(taxd1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
				when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot1+1,0)))*ISNULL(taxi1,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot1+1,0)))* ISNULL(taxi1,0)* ISNULL(taxd1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
                else 0.00
                end
                as TAX1,
                (select taxcode2 from T_TAX_CODE) as T2_Code,
               case 
            when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
            (IsNULL(total,0)*ISNULL(taxot2,0)*ISNULL(taxi2,0)- ISNULL(discount,0)*ISNULL(taxd2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
			when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
           ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot2+1,0)))*ISNULL(taxi2,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot2+1,0)))* ISNULL(taxi2,0)* ISNULL(taxd2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
            else 0.00
            end
            as TAX2,
            (select taxcode3 from T_TAX_CODE) as T3_Code,
               case 
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
               (IsNULL(total,0)*ISNULL(taxot3,0)*ISNULL(taxi3,0)- ISNULL(discount,0)*ISNULL(taxd3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot3+1,0)))*ISNULL(taxi3,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot3+1,0)))* ISNULL(taxi3,0)* ISNULL(taxd3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
                else 0.00
                end
                as TAX3,
                (select taxcode4 from T_TAX_CODE) as T4_Code,
           case 
           when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
           (IsNULL(total,0)*ISNULL(taxot4,0)*ISNULL(taxi4,0)- ISNULL(discount,0)*ISNULL(taxd4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
           when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
           ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot4+1,0)))*ISNULL(taxi4,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot4+1,0)))* ISNULL(taxi4,0)* ISNULL(taxd4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
           else 0.00
           end
           as TAX4,
              (select taxcode5 from T_TAX_CODE) as T5_Code,
               case 
               when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
               (IsNULL(total,0)*ISNULL(taxot5,0)*ISNULL(taxi5,0)- ISNULL(discount,0)*ISNULL(taxd5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
               when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot5+1,0)))*ISNULL(taxi5,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot5+1,0)))* ISNULL(taxi5,0)* ISNULL(taxd5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
               else 0.00
                end
                as TAX5,
                (select taxcode6 from T_TAX_CODE) as T6_Code,
           case 
           when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
           (IsNULL(total,0)*ISNULL(taxot6,0)*ISNULL(taxi6,0)- ISNULL(discount,0)*ISNULL(taxd6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
           when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
           ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot6+1,0)))*ISNULL(taxi6,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot6+1,0)))* ISNULL(taxi6,0)* ISNULL(taxd6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
            else 0.00
           end
           as TAX6,
           (select taxcode7 from T_TAX_CODE) as T7_Code,
                 case
                 when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
                 (IsNULL(total,0)*ISNULL(taxot7,0)*ISNULL(taxi7,0)- ISNULL(discount,0)*ISNULL(taxd7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) ) 
                 when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(1+taxot7,0)))*ISNULL(taxi7,0)- (ISNULL(discount,0)- (ISNULL(discount,0)/ISNULL(1+taxot7,0)))*ISNULL(taxd7,0)* ISNULL(taxi7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) ) 
                 else 0.00
                 end
                 as TAX7,
                 (select taxcode8 from T_TAX_CODE) as T8_Code,
          case 
          when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
          (IsNULL(total,0)*ISNULL(taxot8,0)*ISNULL(taxi8,0)- ISNULL(discount,0)*ISNULL(taxd8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
          when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
		((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot8+1,0)))*ISNULL(taxi8,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot8+1,0)))* ISNULL(taxi8,0)* ISNULL(taxd8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
           else 0.00
          end
          as TAX8,
               (case
               when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot1,0)*ISNULL(taxi1,0)- ISNULL(discount,0)*ISNULL(taxd1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) ) 
               else 0.00
               end
               +
               case
               when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot2,0)*ISNULL(taxi2,0)- ISNULL(discount,0)*ISNULL(taxd2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0) * ISNULL(taxi2,0))  
               else 0.00
               end
               +
                case
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot3,0)*ISNULL(taxi3,0)- ISNULL(discount,0)*ISNULL(taxd3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )  
               else 0.00
               end
               +
               case
                when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot4,0)*ISNULL(taxi4,0)- ISNULL(discount,0)*ISNULL(taxd4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0) * ISNULL(taxi4,0))  
                 else 0.00
               end
                +
                case
                when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot5,0)*ISNULL(taxi5,0)- ISNULL(discount,0)*ISNULL(taxd5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )  
                 else 0.00
               end
               +
               case
                when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot6,0)*ISNULL(taxi6,0)- ISNULL(discount,0)*ISNULL(taxd6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )  
                else 0.00
               end
               +
               case
                when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot7,0)*ISNULL(taxi7,0)- ISNULL(discount,0)*ISNULL(taxd7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) )  
                else 0.00
               end
               +
               case
                when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot8,0)*ISNULL(taxi8,0)- ISNULL(discount,0)*ISNULL(taxd8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )  
                 else 0.00
               end
                ) as ADDON_TAX_TTL,
               
               /* -----*/
               (case
               when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot1+1,0)))*ISNULL(taxi1,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot1+1,0)))* ISNULL(taxi1,0)* ISNULL(taxd1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
               else 0.00
               end
               +
               case
               when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot2+1,0)))*ISNULL(taxi2,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot2+1,0)))* ISNULL(taxi2,0)* ISNULL(taxd2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
               else 0.00
               end
               +
                case
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot3+1,0)))*ISNULL(taxi3,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot3+1,0)))* ISNULL(taxi3,0)* ISNULL(taxd3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
               else 0.00
               end
               +
               case
                when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
             ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot4+1,0)))*ISNULL(taxi4,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot4+1,0)))* ISNULL(taxi4,0)* ISNULL(taxd4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
                 else 0.00
               end
                +
                case
                when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot5+1,0)))*ISNULL(taxi5,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot5+1,0)))* ISNULL(taxi5,0)* ISNULL(taxd5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
                 else 0.00
               end
               +
               case
                when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot6+1,0)))*ISNULL(taxi6,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot6+1,0)))* ISNULL(taxi6,0)* ISNULL(taxd6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
                else 0.00
               end
               +
               case
                when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                   ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot7+1,0)))*ISNULL(taxi7,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot7+1,0)))* ISNULL(taxi7,0)* ISNULL(taxd7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) )
                else 0.00
               end
               +
               case
                when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot8+1,0)))*ISNULL(taxi8,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot8+1,0)))* ISNULL(taxi8,0)* ISNULL(taxd8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
                 else 0.00
               end
                ) as INCLUSIVE_TAX_TTL,PAY , (select max(StringText ) from V_ei_tender where pay=v_EI_TENDER.objectnumber) as T_NAME                      
               
               
               
               
FROM  V_CHECK_DTL_B_FINAL INNER JOIN
               CHECKS ON V_CHECK_DTL_B_FINAL.CheckID = CHECKS.CheckID INNER JOIN
               REVENUE_CENTER ON V_CHECK_DTL_B_FINAL.RevCtrID = REVENUE_CENTER.RevCtrID
               where checkclose is  NOT NULL
               and        
                    PAY not in 
  (SELECT * 
   FROM T_PMS_Tender
  );

`);await request.query(`
/****** Object:  View [dbo].[AON_SIMPHONY]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`







CREATE VIEW [dbo].[AON_SIMPHONY]
AS
SELECT   CheckID as guestChecksId,  cast(CheckOpen as date) as busDt , MENUITEMID as miNum, Gross_B_DSC as aggTtl, Gross_A_DSC as gross,PAY as tmedNum , Discount as ttl , RevCtrID as rvcNum , CheckDetailID as guestCheckLineItemId
FROM            dbo.CHECK_DTL_FINAL AS CF


 --where day(CheckClose)=05 and CheckNumber=14720




`);await request.query(`
/****** Object:  View [dbo].[Daily_Sales_New]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`


--12061 12%

--12064 no12%


CREATE view  [dbo].[Daily_Sales_New]
as

 

(select [CheckNumber]
      ,[CheckID]
      
      ,[CheckClose]
      ,[MENUITEMID]
      ,[MAJGRP]
      ,[FAMGRP]
      ,[NAME]
      ,[SalesCount]
      ,[Gross_B_DSC]
, [AmountAfterDiscount],
[Discount],
--[SVC],[VAT] ,   [AmountAfterDiscount] + [VAT] + [SVC] as 'TOTAL' 
 [T_NAME]
 from (
SELECT 
[CheckNumber]
      ,[CheckID]
      
      ,[CheckClose]
      ,[MENUITEMID]
      ,[MAJGRP]
      ,[FAMGRP]
      ,[NAME]
      ,[SalesCount]
      ,[Gross_B_DSC]
	  , ([Gross_B_DSC] - [Discount]) as AmountAfterDiscount
      ,[Discount]
	  --, case when T_NAME not in( 'Officer','Comp','CL') then (case when RevCtrID = '12061' then ([Gross_B_DSC] - [Discount]) *0.12 when RevCtrID =    '12064' then 0  end) else 0 end as 'SVC' 
	  --,case when T_NAME not in( 'Officer','Comp','CL') then  ((  case when RevCtrID = '12061' then ([Gross_B_DSC] - [Discount]) *0.12 when RevCtrID = '12064' then 0  end) + [Gross_B_DSC]  ) *0.14 else 0 end   as 'VAT'
      ,isnull([T_NAME],'Undefined') as 'T_NAME'
      ,[Day]
  FROM [CheckPostingDB].[dbo].[BI_Daily_Sales]) as Q where T_NAME!='Undefined' )
  


`);await request.query(`
/****** Object:  View [dbo].[Daily_Sales_as_header]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
/****** Script for SelectTopNRows command from SSMS  ******/
create view [dbo].[Daily_Sales_as_header] as
SELECT  [CheckNumber]
     
      
      
      
      ,sum([Gross_B_DSC])gros
     , sum([AmountAfterDiscount])afterdis
      ,sum([Discount]) dis
      ,sum([SVC]) svc
      ,sum([VAT]) vat
      ,sum([TOTAL]) total
      
  FROM [CheckPostingDB].[dbo].[Daily_Sales_New]
    where day([CheckClose])=05 and month([CheckClose])=12 and [T_NAME] is not null and 
	[T_NAME] in( 'cash','Visa','master') and [Gross_B_DSC]!=0 

     group by [CheckNumber]

`);await request.query(`
/****** Object:  View [dbo].[BI_Get_Data_F_Daily_Sales]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`
CREATE view [dbo].[BI_Get_Data_F_Daily_Sales]
as

SELECT        CheckID, 
RIGHT('0' + RTRIM(YEAR(CheckClose)), 4) AS Year, 

RIGHT('0' + RTRIM(MONTH(CheckClose)), 2) AS Month, 
RIGHT('0' + RTRIM(DAY(CheckClose)), 2) AS Day,
datepart (hour,CheckClose) hour, CheckClose,

case 
when datepart (hour,CheckClose) between 7 and 12 
then 'Morning' 
when datepart (hour,CheckClose) between 13 and 16
then 'Afternoon' 
when datepart (hour,CheckClose) between 17 and 23
then 'Evening' 
when datepart (hour,CheckClose) between 0 and 6
then 'night' 
else 'other'  
end as 'shift',
 MENUITEMID, MAJGRP, FAMGRP, NAME, SalesCount, IsNULL( Gross_B_DSC,0) as Gross,IsNULL( Discount,0) Discount,IsNULL(AmountAfterDiscount,0) AmountAfterDiscount,
 IsNULL(SVC,0) SVC,IsNULL(VAT,0) VAT,IsNULL(TOTAL,0) TOTAL
 , '234' as OutletID, T_name AS Payment,DATENAME(DW,checkclose) as Dayname
 , CONCAT( '234_' , MENUITEMID) as NewitemID


FROM            Daily_Sales_New
`);await request.query(`
/****** Object:  View [dbo].[CHECK_DTL_FINAL_For_open_CHK]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`


create view [dbo].[CHECK_DTL_FINAL_For_open_CHK]
as
SELECT V_CHECK_DTL_B_FINAL.CheckID, CHECKS.CheckNumber, CHECKS.CheckClose, checks.CheckOpen,checks.alternateid,REVENUE_CENTER.ObjectNumber,[CheckDetailID], V_CHECK_DTL_B_FINAL.ObjectNumber AS MENUITEMID,
(select [MajGrpObjNum] from [V_MI_NAME_GRP] where  V_CHECK_DTL_B_FINAL.[CheckDetailID] = [V_MI_NAME_GRP].[CheckDetailID]) as MAJGRP,
(select [FAMGrpObjNum] from [V_MI_NAME_GRP] where  V_CHECK_DTL_B_FINAL.[CheckDetailID] = [V_MI_NAME_GRP].[CheckDetailID]) as FAMGRP,
(select [StringText] from [V_MI_NAME_GRP] where  V_CHECK_DTL_B_FINAL.[CheckDetailID] = [V_MI_NAME_GRP].[CheckDetailID]) as NAME,
               V_CHECK_DTL_B_FINAL.SalesCount, V_CHECK_DTL_B_FINAL.Total as Gross_B_DSC, V_CHECK_DTL_B_FINAL.RevCtrID,
              case when  V_CHECK_DTL_B_FINAL.taxdttl = 0 then 'F'  
               when V_CHECK_DTL_B_FINAL.taxdttl is  NULL then  'F' else 'T' end as DSC_AFT_TAX,

               
               V_CHECK_DTL_B_FINAL.Discount,(V_CHECK_DTL_B_FINAL.Total - V_CHECK_DTL_B_FINAL.Discount)  as Gross_A_DSC, ISNULL(V_CHECK_DTL_B_FINAL.Schg,0) - ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0) 
               AS SCHG,
                    (V_CHECK_DTL_B_FINAL.Total - V_CHECK_DTL_B_FINAL.Discount)- 
                     (case
               when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot1+1,0)))*ISNULL(taxi1,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot1+1,0)))* ISNULL(taxi1,0)* ISNULL(taxd1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
               else 0.00
               end
               +
               case
               when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot2+1,0)))*ISNULL(taxi2,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot2+1,0)))* ISNULL(taxi2,0)* ISNULL(taxd2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
               else 0.00
               end
               +
                case
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot3+1,0)))*ISNULL(taxi3,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot3+1,0)))* ISNULL(taxi3,0)* ISNULL(taxd3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
               else 0.00
               end
               +
               case
                when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot4+1,0)))*ISNULL(taxi4,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot4+1,0)))* ISNULL(taxi4,0)* ISNULL(taxd4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
                 else 0.00
               end
                +
                case
                when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot5+1,0)))*ISNULL(taxi5,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot5+1,0)))* ISNULL(taxi5,0)* ISNULL(taxd5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
                 else 0.00
               end
               +
               case
                when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot6+1,0)))*ISNULL(taxi6,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot6+1,0)))* ISNULL(taxi6,0)* ISNULL(taxd6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
                else 0.00
               end
               +
               case
                when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                   ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot7+1,0)))*ISNULL(taxi7,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot7+1,0)))* ISNULL(taxi7,0)* ISNULL(taxd7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) )
                else 0.00
               end
               +
               case
                when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ( (IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot8+1,0)))*ISNULL(taxi8,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot8+1,0)))* ISNULL(taxi8,0)* ISNULL(taxd8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
                 else 0.00
               end
                ) 
               
               as NET_A_DSC,
               (select taxcode1 from T_TAX_CODE) as T1_Code,
               case 
                when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
                (IsNULL(total,0)*ISNULL(taxot1,0)*ISNULL(taxi1,0)- ISNULL(discount,0)*ISNULL(taxd1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
				when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot1+1,0)))*ISNULL(taxi1,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot1+1,0)))* ISNULL(taxi1,0)* ISNULL(taxd1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
                else 0.00
                end
                as TAX1,
                (select taxcode2 from T_TAX_CODE) as T2_Code,
               case 
            when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
            (IsNULL(total,0)*ISNULL(taxot2,0)*ISNULL(taxi2,0)- ISNULL(discount,0)*ISNULL(taxd2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
			when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
           ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot2+1,0)))*ISNULL(taxi2,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot2+1,0)))* ISNULL(taxi2,0)* ISNULL(taxd2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
            else 0.00
            end
            as TAX2,
            (select taxcode3 from T_TAX_CODE) as T3_Code,
               case 
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
               (IsNULL(total,0)*ISNULL(taxot3,0)*ISNULL(taxi3,0)- ISNULL(discount,0)*ISNULL(taxd3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot3+1,0)))*ISNULL(taxi3,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot3+1,0)))* ISNULL(taxi3,0)* ISNULL(taxd3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
                else 0.00
                end
                as TAX3,
                (select taxcode4 from T_TAX_CODE) as T4_Code,
           case 
           when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
           (IsNULL(total,0)*ISNULL(taxot4,0)*ISNULL(taxi4,0)- ISNULL(discount,0)*ISNULL(taxd4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
           when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
           ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot4+1,0)))*ISNULL(taxi4,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot4+1,0)))* ISNULL(taxi4,0)* ISNULL(taxd4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
           else 0.00
           end
           as TAX4,
              (select taxcode5 from T_TAX_CODE) as T5_Code,
               case 
               when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
               (IsNULL(total,0)*ISNULL(taxot5,0)*ISNULL(taxi5,0)- ISNULL(discount,0)*ISNULL(taxd5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
               when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot5+1,0)))*ISNULL(taxi5,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot5+1,0)))* ISNULL(taxi5,0)* ISNULL(taxd5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
               else 0.00
                end
                as TAX5,
                (select taxcode6 from T_TAX_CODE) as T6_Code,
           case 
           when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
           (IsNULL(total,0)*ISNULL(taxot6,0)*ISNULL(taxi6,0)- ISNULL(discount,0)*ISNULL(taxd6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
           when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
           ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot6+1,0)))*ISNULL(taxi6,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot6+1,0)))* ISNULL(taxi6,0)* ISNULL(taxd6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
            else 0.00
           end
           as TAX6,
           (select taxcode7 from T_TAX_CODE) as T7_Code,
                 case
                 when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
                 (IsNULL(total,0)*ISNULL(taxot7,0)*ISNULL(taxi7,0)- ISNULL(discount,0)*ISNULL(taxd7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) ) 
                 when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(1+taxot7,0)))*ISNULL(taxi7,0)- (ISNULL(discount,0)- (ISNULL(discount,0)/ISNULL(1+taxot7,0)))*ISNULL(taxd7,0)* ISNULL(taxi7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) ) 
                 else 0.00
                 end
                 as TAX7,
                 (select taxcode8 from T_TAX_CODE) as T8_Code,
          case 
          when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then 
          (IsNULL(total,0)*ISNULL(taxot8,0)*ISNULL(taxi8,0)- ISNULL(discount,0)*ISNULL(taxd8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
          when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then 
		((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot8+1,0)))*ISNULL(taxi8,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot8+1,0)))* ISNULL(taxi8,0)* ISNULL(taxd8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
           else 0.00
          end
          as TAX8,
               (case
               when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot1,0)*ISNULL(taxi1,0)- ISNULL(discount,0)*ISNULL(taxd1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) ) 
               else 0.00
               end
               +
               case
               when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot2,0)*ISNULL(taxi2,0)- ISNULL(discount,0)*ISNULL(taxd2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0) * ISNULL(taxi2,0))  
               else 0.00
               end
               +
                case
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot3,0)*ISNULL(taxi3,0)- ISNULL(discount,0)*ISNULL(taxd3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )  
               else 0.00
               end
               +
               case
                when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot4,0)*ISNULL(taxi4,0)- ISNULL(discount,0)*ISNULL(taxd4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0) * ISNULL(taxi4,0))  
                 else 0.00
               end
                +
                case
                when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot5,0)*ISNULL(taxi5,0)- ISNULL(discount,0)*ISNULL(taxd5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )  
                 else 0.00
               end
               +
               case
                when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot6,0)*ISNULL(taxi6,0)- ISNULL(discount,0)*ISNULL(taxd6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )  
                else 0.00
               end
               +
               case
                when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot7,0)*ISNULL(taxi7,0)- ISNULL(discount,0)*ISNULL(taxd7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) )  
                else 0.00
               end
               +
               case
                when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=2 then
               (IsNULL(total,0)*ISNULL(taxot8,0)*ISNULL(taxi8,0)- ISNULL(discount,0)*ISNULL(taxd8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )  
                 else 0.00
               end
                ) as ADDON_TAX_TTL,
               
               /* -----*/
               (case
               when(select tax_t1 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot1+1,0)))*ISNULL(taxi1,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot1+1,0)))* ISNULL(taxi1,0)* ISNULL(taxd1,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc1,0)*ISNULL(taxot1,0)* ISNULL(taxi1,0) )
               else 0.00
               end
               +
               case
               when(select tax_t2 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
               ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot2+1,0)))*ISNULL(taxi2,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot2+1,0)))* ISNULL(taxi2,0)* ISNULL(taxd2,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc2,0)*ISNULL(taxot2,0)* ISNULL(taxi2,0) )
               else 0.00
               end
               +
                case
               when(select tax_t3 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot3+1,0)))*ISNULL(taxi3,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot3+1,0)))* ISNULL(taxi3,0)* ISNULL(taxd3,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc3,0)*ISNULL(taxot3,0)* ISNULL(taxi3,0) )
               else 0.00
               end
               +
               case
                when(select tax_t4 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
             ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot4+1,0)))*ISNULL(taxi4,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot4+1,0)))* ISNULL(taxi4,0)* ISNULL(taxd4,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc4,0)*ISNULL(taxot4,0)* ISNULL(taxi4,0) )
                 else 0.00
               end
                +
                case
                when(select tax_t5 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot5+1,0)))*ISNULL(taxi5,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot5+1,0)))* ISNULL(taxi5,0)* ISNULL(taxd5,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc5,0)*ISNULL(taxot5,0)* ISNULL(taxi5,0) )
                 else 0.00
               end
               +
               case
                when(select tax_t6 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot6+1,0)))*ISNULL(taxi6,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot6+1,0)))* ISNULL(taxi6,0)* ISNULL(taxd6,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc6,0)*ISNULL(taxot6,0)* ISNULL(taxi6,0) )
                else 0.00
               end
               +
               case
                when(select tax_t7 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                   ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot7+1,0)))*ISNULL(taxi7,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot7+1,0)))* ISNULL(taxi7,0)* ISNULL(taxd7,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc7,0)*ISNULL(taxot7,0)* ISNULL(taxi7,0) )
                else 0.00
               end
               +
               case
                when(select tax_t8 from [V_CHK_ORD_Tax] where V_CHECK_DTL_B_FINAL.[CheckID] = [V_CHK_ORD_Tax].checkid)=3 then
                 ((IsNULL(total,0)-(IsNULL(total,0)/ISNULL(taxot8+1,0)))*ISNULL(taxi8,0)-(ISNULL(discount,0)- (ISNULL(discount,0)/ ISNULL(taxot8+1,0)))* ISNULL(taxi8,0)* ISNULL(taxd8,0)+(ISNULL(SCHG,0)- ISNULL(V_CHECK_DTL_B_FINAL.DSC_Schg, 0)) *ISNULL(taxc8,0)*ISNULL(taxot8,0)* ISNULL(taxi8,0) )
                 else 0.00
               end
                ) as INCLUSIVE_TAX_TTL,PAY , (select max(StringText ) from V_ei_tender where pay=v_EI_TENDER.objectnumber) as T_NAME                      
               
               
               
               
FROM  V_CHECK_DTL_B_FINAL INNER JOIN
               CHECKS ON V_CHECK_DTL_B_FINAL.CheckID = CHECKS.CheckID INNER JOIN
               REVENUE_CENTER ON V_CHECK_DTL_B_FINAL.RevCtrID = REVENUE_CENTER.RevCtrID
               where checkclose is   NULL
               and        
                    PAY not in 
  (SELECT * 
   FROM T_PMS_Tender
  );

`);await request.query(`
/****** Object:  View [dbo].[BI_Total_Check]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`







CREATE VIEW [dbo].[BI_Total_Check]
AS
SELECT DISTINCT 
                         CheckID, RIGHT('0' + RTRIM(YEAR(CheckClose)), 4) AS Year,
						 RIGHT('0' + RTRIM(MONTH(CheckClose)), 2) AS Month, 
						 RIGHT('0' + RTRIM(DAY(CheckClose)), 2) AS Day, 
						 DATEPART(hour, CheckClose) AS hour, T_NAME,
                         CheckClose, case 
when datepart (hour,CheckClose) between 7 and 12 
then 'Morning' 
when datepart (hour,CheckClose) between 13 and 16
then 'Afternoon' 
when datepart (hour,CheckClose) between 17 and 23
then 'Evening' 
when datepart (hour,CheckClose) between 0 and 6
then 'night' 
else 'other'  
end as 'shift',
						 DATENAME(DW,checkclose) as DayName
FROM            dbo.CHECK_DTL_FINAL

where T_NAME is not null

`);await request.query(`
/****** Object:  View [dbo].[BI_Total_Guests]    Script Date: 17/05/2022 11:49:58 AM ******/
SET ANSI_NULLS ON
`);await request.query(`
SET QUOTED_IDENTIFIER ON
`);await request.query(`





CREATE VIEW [dbo].[BI_Total_Guests]
AS
SELECT DISTINCT 
                         Covers, RIGHT('0' + RTRIM(YEAR(CheckClose)), 4) AS Year, RIGHT('0' + RTRIM(MONTH(CheckClose)), 2) AS Month, RIGHT('0' + RTRIM(DAY(CheckClose)), 2) AS Day, 
						 case 
when datepart (hour,CheckClose) between 7 and 12 
then 'Morning' 
when datepart (hour,CheckClose) between 13 and 16
then 'Afternoon' 
when datepart (hour,CheckClose) between 17 and 23
then 'Evening' 
when datepart (hour,CheckClose) between 0 and 6
then 'night' 
else 'other'  
end as 'shift',
						 DATENAME(DW,checkclose) as DayName ,'Other' as payment,checkclose

FROM            dbo.CHECKS
WHERE        (CheckClose IS NOT NULL)

`); 
         
		
        console.log(createViews);
		

        res.json("views created successfully")
        // if(createDatabase.recordset==undefined){
          
        //     res.json('Submitted ')
        // }
        // else
        //     res.json("Already exist")
        
    }
    catch (error) {
        res.json(error.message)
    }

}