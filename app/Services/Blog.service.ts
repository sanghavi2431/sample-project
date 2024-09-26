import { uploadBuffer, uploadFile } from "./../utilities/S3Bucket";
import moment from "moment";
import config from "../config";
import { BlogModel } from "./../Models/Blog.model";
import { WolooHostModel } from "../Models/WolooHost.model";

import path from "path";
import { WalletModel } from "../Models/Wallet.model";
import formidable from "formidable";
import { isNumber } from "lodash";
import HttpClient from "../utilities/HttpClient";
const axios = require("axios");
const fs = require("fs");
const sharp = require("sharp");

const getBlogsForUserByCategory = async (
  userId: number,
  category: any,
  path: string,
  offset: number
) => {
  try {
    let blogDetailLink = "";
    // console.log(path, " :path");
    
    if (path.includes("arkloop.com")) {
      blogDetailLink = `/woloo/mobile_blog_detail/`;
    } else {
      blogDetailLink = `/mobile_blog_detail/`;
    }

    let updated_at = "2021-11-23 11:00";
    let getBlogCount = await new BlogModel().getBlogCount(updated_at);

    if (getBlogCount > 0) {
      await new BlogModel().updateBlog();
    }

    let getBlogShortLinkCount = await new BlogModel().getBlogShortLinkCount();
    
    if (getBlogShortLinkCount > 0) {
      let allBlankShortUrlBlogs = await new BlogModel().allBlankShortUrlBlogs();

      for (const row of allBlankShortUrlBlogs) {
        let blog = row;

        const blogId = row.id;

        let shortBlogLink = await getShortLink(`${blogDetailLink}${blogId}`);

        if (shortBlogLink != "") {
          blog.short_link = shortBlogLink?.shortLink;
          let id = blog.id;
          delete blog.id;
          await new BlogModel().saveBlog(id, blog);
        }
      }
    }

    let nonSelectedCategory = false;
    let categoryIconLink = "";
    let limit = 10;
    let data: any = {};

    // if (!isNaN(category)) {
    if (!isNaN(category)) {
      let categories = [];
      let subCategories = [];
      let catIds: any[] = [];

      if (nonSelectedCategory) {
        categories = await new BlogModel().categories(categoryIconLink);
        subCategories = await new BlogModel().subCategories(categoryIconLink);
      } else {
        categories = await new BlogModel().userSavedCategoryes(userId);
        var arrCategories_for_sub_categories: any = [];
        categories.forEach((element: any) => {
          arrCategories_for_sub_categories.push(element.id);
        });
        subCategories = await new BlogModel().categoryesInIds(
          categoryIconLink,
          arrCategories_for_sub_categories
        );
      }
      categories.forEach((element: any) => {
        element.category_icon_url =
          config.s3imagebaseurl + element.category_icon_url;
        catIds.push(element.id);
      });
      var blogs = await new BlogModel().selectBlogs(
        userId,
        limit,
        offset,
        category
      );
      data.blogs = blogs;
      data.categories = categories;
      data.sub_categories = subCategories;
      data.baseUrl = config.s3imagebaseurl;
    } else if (category.toString().toLowerCase() == "all") {
      blogs = [];
      var categories = [];
      var subCategories = [];
      if (nonSelectedCategory) {
        var blogs = await new BlogModel().selectBlogsNonSelectedCategory(
          userId,
          limit,
          offset
        );
        categories = await new BlogModel().categories(categoryIconLink);
        subCategories = await new BlogModel().subCategories(categoryIconLink);
      } else {
        let arrUserSavedCategories: string[] = [];
        var userSavedCategories = await new BlogModel().concatCategories(
          userId
        );
        if (
          userSavedCategories.length &&
          userSavedCategories[0]["user_category_id"]
        ) {
          arrUserSavedCategories =
            userSavedCategories[0]["user_category_id"].split(",");
        }
        let strFindInSet = "";
        for (let item of arrUserSavedCategories) {
          strFindInSet += ` ( FIND_IN_SET( ${item}, blog_category ) ) OR`;
        }
        strFindInSet = strFindInSet.slice(0, -2);
        var blogs = await new BlogModel().thirdBigSelectQuery(
          userId,
          limit,
          offset,
          strFindInSet
        );
        categories = await new BlogModel().userSavedCategoryes(userId);
        var arrCategories_for_sub_categories: any = [];
        categories.forEach((element: any) => {
          element.category_icon_url =
            config.s3imagebaseurl + element.category_icon_url;

          arrCategories_for_sub_categories.push(element.id);
        });
        subCategories = await new BlogModel().categoryesInIds(
          categoryIconLink,

          arrCategories_for_sub_categories
        );
      }
      data.blogs = blogs;
      data.categories = categories;
      data.sub_categories = subCategories;
      data.baseUrl = config.s3imagebaseurl;
    }
    return data;
  } catch (e) {
    console.log(e);
    throw new Error("Something went wrong !");
  }
};

const getShortLink = async (blogLink: any) => {
  const url = config.firebaseLink.url;
  var data: any = JSON.stringify({
    dynamicLinkInfo: {
      domainUriPrefix: config.firebaseLink.domainUriPrefix,
      link: `https://app.woloo.in${blogLink}`,
      androidInfo: {
        androidPackageName: config.firebaseLink.androidPackageName,
      },
      iosInfo: {
        iosBundleId: config.firebaseLink.iosBundleId,
      },
    },
  });
  return await HttpClient.api("POST", url, { data: data });
};

const getUserSavedCategories = async (userId: number) => {
  try {
    let userSavedCategories = await new BlogModel().getUserSavedCategories(
      userId
    );
    if (userSavedCategories[0]["user_saved_categories"] == null) {
      return [];
    } else {
      return userSavedCategories[0]["user_saved_categories"].split(",");
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

const blogReadPoint: any = async (userId: number, blogId: number) => {
  try {
    if (!blogId) return new Error("Blog id is required!");
    let isBlogExist = await new BlogModel().isBlogExist(blogId);
    if (!isBlogExist.length) return new Error("Blog id does not exist!");
    let checkBlogPoint = await new BlogModel().checkBlogPoint(userId, blogId);
    if (checkBlogPoint.length) {
      return {
        message: "Blog point already added",
      };
    }
    let addBlogPoint = await new BlogModel().addBlogPoint(userId, blogId);
    if (!addBlogPoint.affectedRows) {
      throw new Error("Something went wrong !");
    }
    return {
      message: "Added blog read point",
    };
  } catch (e) {
    throw e;
  }
};

const getBlogs = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = " order by id DESC,created_at DESC ";
    }
    let blogs = await new BlogModel().getBlogs(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (!blogs.length) {
      return "No data found!";
    } else {
      blogs = blogs.map((cat: any) => {
        if (cat.main_image?.includes("Images")) {
          cat.main_image = config.s3imagebaseurl + cat.main_image;
        } else {
          cat.main_image = config.wolooBaseUrl + "/blog/" + cat.main_image;
        }
        return cat;
      });
      return blogs;
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

const getBlogsbyID = async (blog_id: number) => {
  try {
    let blogs = await new BlogModel().getBlogsbyID(blog_id);
    if (!blogs.length) {
      return "No data found!";
    } else {
      return blogs[0];
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

const getCategories = async (req: any) => {
  try {
    let category = await new BlogModel().getCategories();
    if (!category.length) {
      return "No data found!";
    } else {
      category = category.map((cat: any) => {
        cat.category_icon_url =
          "https://woloo-prod.s3.ap-south-1.amazonaws.com/" +
          cat.category_icon_url;
        return cat;
      });
      return category;
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const getCategoriesbyId = async (id: any) => {
  try {
    let query = `where id=${id}`;
    let category = await new BlogModel().getCategoriesbyId(query);
    if (!category.length) {
      return Error("Invalid Id!");
    }
    if (category?.[0]?.icon?.includes("Images")) {
      category[0].icon = config.s3imagebaseurl + category[0].icon;
    } else {
      category[0].icon = config.wolooBaseUrl + "/blog/" + category[0].icon;
    }
    return category[0];
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const getSubCategoriesbyId = async (id: any) => {
  try {
    let query = `where bsc.id=${id}`;
    let category = await new BlogModel().getSubCategoriesbyId(query);
    if (!category.length) {
      return Error("Invalid Id!");
    }
    category[0].status = category[0].status
      ? { label: "Active", value: 1 }
      : { label: "Inactive", value: 0 };
    // category[0].icon = config.s3imagebaseurl + category[0].icon;
    category[0].category_name = category[0].category_name && {
      label: category[0].category_name,
      value: category[0].category_id,
    };
    delete category[0].category_id;
    if (category?.[0]?.icon?.includes("Images")) {
      category[0].icon = config.s3imagebaseurl + category?.[0]?.icon;
    } else {
      category[0].icon = config.wolooBaseUrl + "/blog/" + category?.[0]?.icon;
    }
    return category[0];
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const getBlogs_byId = async (id: any) => {
  try {
    let blog = await new BlogModel().getBlogDetails(id);
    let blog_category: any = [];
    let blog_sub_category: any = [];
    if (!blog.length) {
      return Error("Invalid Id!");
    }
    let category = await new BlogModel().getBlogCategoryNamebyId(id);
    category.map((cat: any, ind: number) => {
      if (cat.blog_category) {
        let blogCategory = cat.blog_category.split(",");
        blog_category.push({
          label: cat.category_name,
          value: blogCategory[ind],
        });
      }
    });
    let subCategory = await new BlogModel().getBlogSubCategoryNamebyId(id);
    subCategory.map((cat: any, ind: number) => {
      let blogSubCategory = cat.blog_sub_category.split(",");
      blog_sub_category.push({
        label: cat.sub_category,
        value: blogSubCategory[ind],
      });
    });
    if (blog?.[0]?.main_image?.includes("Images")) {
      blog[0].main_image = config.s3imagebaseurl + blog[0].main_image;
    } else {
      blog[0].main_image = config.wolooBaseUrl + "/blog/" + blog[0].main_image;
    }
    blog[0].blog_category = blog_category;
    blog[0].blog_sub_category = blog_sub_category;
    blog[0].status = blog[0].status
      ? { label: "Active", value: 1 }
      : { label: "Inactive", value: 0 };

    return blog[0];
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const processBlogForm = async (req: any) => {
  let s3Path: any = [];

  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        const images: any = files.icon;
        if (images) {
          const imageName =
            moment().unix() + "." + images.originalFilename.split(".").pop();

          let name: string = "Images/" + "category" + "/" + imageName;

          const result = await uploadFile(images, name);
          console.log(result);

          if (result == 0 && result == undefined)
            throw new Error("file upload to s3 failed");

          s3Path.push(result.key);
        }

        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};
const processActiveBlogForm = async (req: any) => {
  let s3Path: any = [];

  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        const images: any = files.main_image;
        if (images) {
          const imageName =
            moment().unix() + "." + images.originalFilename.split(".").pop();

          let name: string = "Images/" + "category" + "/" + imageName;

          const result = await uploadFile(images, name);

          if (result == 0 && result == undefined)
            throw new Error("file upload to s3 failed");

          s3Path.push(result.key);
        }

        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};
const insertBlogCategory = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    let categoryData: any = {};
    response = await processBlogForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    if (!fields.category_name) throw new Error("Please enter your name");
    categoryData.category_name = fields.category_name;
    categoryData.icon = s3Path[0];
    let category = await new BlogModel().insert_blog_category(categoryData);
    if (!category?.affectedRows) {
      return Error("Insert Failed!");
    }
    return { Response: "BLOG CATEGORY CREATED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const insert_blog_Subcategory = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    let sub_categoryData: any = {};
    response = await processBlogForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    if (!fields.sub_category) throw new Error("Please enter your name");
    sub_categoryData.sub_category = fields.sub_category;
    sub_categoryData.category_id = fields.category_id;
    sub_categoryData.icon = s3Path[0];
    let category = await new BlogModel().insert_blog_Subcategory(
      sub_categoryData
    );
    if (!category?.affectedRows) {
      return Error("Insert Failed!");
    }
    return { Response: "BLOG SUB CATEGORY CREATED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const updateBlogCategory = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    let categoryData: any = {};
    response = await processBlogForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    if (!fields.category_name) throw new Error("Please enter your name");
    categoryData.category_name = fields.category_name;
    if (s3Path[0]) {
      categoryData.icon = s3Path[0];
    }
    categoryData.status = fields.status;
    let category = await new BlogModel().updateBlogCategory(
      categoryData,
      fields?.id
    );

    if (!category?.affectedRows) {
      return Error("Failed to Update!");
    }
    return { Response: "BLOG CATEGORY UPDATED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const updateBlogSubCategory = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    let sub_categoryData: any = {};
    response = await processBlogForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    if (!fields.sub_category) throw new Error("Please enter your name");
    sub_categoryData.sub_category = fields.sub_category;
    sub_categoryData.category_id = fields.category_id;
    sub_categoryData.status = fields.status;
    if (s3Path[0]) {
      sub_categoryData.icon = s3Path[0];
    }
    let category = await new BlogModel().updateBlogSubCategory(
      sub_categoryData,
      fields?.id
    );

    if (!category?.affectedRows) {
      return Error("Failed to Update!");
    }
    return { Response: "BLOG SUB-CATEGORY UPDATED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const update_Blog = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    let blogs_data: any = {};
    response = await processActiveBlogForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    blogs_data.blog_category = fields.blog_category;
    blogs_data.blog_sub_category = fields.blog_sub_category;
    blogs_data.content = fields.content;
    blogs_data.title = fields.title;
    blogs_data.status = fields.status;
    blogs_data.author_id = fields.author_id;

    if (s3Path[0]) {
      blogs_data.main_image = s3Path[0];
    }
    let category = await new BlogModel().update_Blog(blogs_data, fields?.id);

    if (!category?.affectedRows) {
      return Error("Failed to Update!");
    }
    return { Response: "BLOG UPDATED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const create_Blog = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    let blogs_data: any = {};
    response = await processActiveBlogForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    blogs_data.blog_category = fields.blog_category;
    blogs_data.blog_sub_category = fields.blog_sub_category;
    blogs_data.content = fields.content;
    blogs_data.title = fields.title;
    blogs_data.author_id = fields.author_id;

    if (s3Path[0]) {
      blogs_data.main_image = s3Path[0];
    }
    let category = await new BlogModel().create_Blog(blogs_data);

    if (!category?.affectedRows) {
      return Error("Failed to Create!");
    }
    return { Response: "BLOG CREATED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const deleteBlogCategorybyId = async (req: any) => {
  try {
    let category = await new BlogModel().deleteBlogCategorybyId(req.query.id);
    if (!category.affectedRows) {
      return Error("Invalid !");
    }
    return { Response: "BLOG CATEGORY DELETED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const deleteBlogSubCategorybyId = async (req: any) => {
  try {
    let category = await new BlogModel().deleteBlogSubCategorybyId(
      req.query.id
    );
    if (!category.affectedRows) {
      return Error("Invalid !");
    }
    return { Response: "BLOG SUB-CATEGORY DELETED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const deleteBlogbyId = async (req: any) => {
  try {
    let blog = await new BlogModel().deleteBlogbyId(req.query.id);
    if (!blog.affectedRows) {
      return Error("Invalid !");
    }
    return { Response: "BLOG DELETED SUCCESSFULLY" };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const ecomCoinTotal = async (userId: number) => {
  try {
    let creditAmount = await new WolooHostModel().creditAmount(userId);
    let debitAmount = await new WolooHostModel().debitAmount(userId);
    let totalCoins = creditAmount[0].creditAmount - debitAmount[0].debitAmount;

    let giftCoinsCredit = await new WolooHostModel().giftCoinsCredit(userId);
    let giftCoinsDebit = await new WolooHostModel().giftCoinsDebit(userId);
    let giftCoins =
      giftCoinsCredit[0].giftCoinsCredit - giftCoinsDebit[0].giftCoinsDebit;
    let response: any = {};
    response.woloo_point = totalCoins;
    response.gift_coins = giftCoins ? giftCoins : 0;
    return response;
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

const ecomCoinUpdate = async (
  userId: number,
  type: string,
  coins: number,
  orderid: string
) => {
  try {
    if (!type) return new Error("Type required!");
    if (coins == 0) return new Error("Coins should be greater than 0");
    if (!coins) return new Error("Coins details required!");
    if (!orderid) return new Error("Order id required!");

    if (userId) {
      if (type == "points") {
        let creditAmount = await new WolooHostModel().creditAmount(userId);
        let debitAmount = await new WolooHostModel().debitAmount(userId);

        let totalCoins =
          creditAmount[0].creditAmount - debitAmount[0].debitAmount;

        let totalPointAfterTransaction = totalCoins - coins;

        if (totalPointAfterTransaction >= 0) {
          let data = {
            user_id: userId,
            sender_receiver_id: 0,
            transaction_type: "DR",
            remarks: `Ecom points debit${orderid ? " - " + orderid : ""}`,
            value: coins,
            type: "Ecom Points Debit",
            is_gift: 0,
          };
          await new WalletModel().createWallet(data);

          return {
            message: "Transaction updated successfully.",
            remaining_coins: totalPointAfterTransaction,
          };
        } else {
          return new Error("Insufficent woloo points!");
        }
      } else if (type == "gift") {
        let giftCoinsCredit = await new WolooHostModel().giftCoinsCredit(
          userId
        );
        let giftCoinsDebit = await new WolooHostModel().giftCoinsDebit(userId);
        let giftCoins =
          giftCoinsCredit[0].giftCoinsCredit - giftCoinsDebit[0].giftCoinsDebit;
        let totalPointAfterTransaction = giftCoins - coins;

        if (totalPointAfterTransaction >= 0) {
          let data = {
            user_id: userId,
            sender_receiver_id: 0,
            transaction_type: "DR",
            remarks: `Ecom gift debit${orderid ? " - " + orderid : ""}`,
            value: coins,
            type: "Ecom Points Debit",
            is_gift: 1,
          };

          await new WalletModel().createWallet(data);

          return {
            message: "Transaction updated successfully.",
            remaining_coins: totalPointAfterTransaction,
          };
        } else {
          return new Error("Insufficient gift coins!");
        }
      } else {
        return new Error("Please enter correct type!");
      }
    }
  } catch (e: any) {
    throw new Error("Something went wrong !");
  }
};

const ecomTransactionFail = async (userId: any, transactionId: any) => {
  try {
    if (!transactionId) return new Error("transaction id required!");
    if (userId) {
      let transactionExist = await new WalletModel().getWalletById(
        userId,
        transactionId
      );

      if (transactionExist.length) {
        await new WalletModel().deleteWallet(userId, transactionId);
        return {
          message: "Transaction updated successfully!",
          transaction_id: Number(transactionId),
        };
      } else {
        return new Error("Invalid transaction details!");
      }
    } else {
      return new Error("Something went wrong !");
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const ctaLikes = async (req: any) => {
  try {
    let blog_id = req.query.blog_id;
    let userId = req.session.id;
    let isBlogExist = await new BlogModel().isBlogExist(blog_id);
    if (!isBlogExist.length) return new Error("blog id does not exist!");
    let existingLikes = await new BlogModel().getBlogLike(blog_id);

    if (existingLikes.length == 0) {
      await new BlogModel()._executeQuery(
        `insert into blog_likes set user_ids="${userId}", blog_id=${blog_id}`,
        []
      );
      return { like_counts: 1 };
    }
    if (existingLikes[0]["user_ids"] == "") {
      existingLikes = [];
    } else {
      existingLikes = existingLikes[0]["user_ids"].split(",");
    }
    if (existingLikes.includes(userId.toString())) {
      existingLikes = existingLikes.filter(
        (element: any) => element !== userId.toString()
      );
    } else {
      existingLikes.push(userId);
    }
    if (existingLikes.length == 0) {
      await new BlogModel()._executeQuery(
        `update blog_likes set user_ids="" where blog_id=${blog_id}`,
        []
      );
    } else {
      await new BlogModel()._executeQuery(
        `update blog_likes set user_ids="${existingLikes.join(
          ","
        )}" where blog_id=${blog_id}`,
        []
      );
    }
    return { like_counts: existingLikes.length };
  } catch (e) {
    console.log(e);
    throw new Error("Something went wrong !");
  }
};

const ctaFavourite = async (req: any) => {
  let blogId = req.query.blog_id;
  let userId = req.session.id;

  try {
    let existingBlogUserFav = await new BlogModel().existingBlogUserFav(
      blogId,
      userId
    );
    let boolCta = true;
    if (!existingBlogUserFav.length) {
      //mark favourite
      let fav = {
        blog_id: blogId,
        user_id: userId,
      };
      await new BlogModel().saveFevBlog(fav);
    } else {
      await new BlogModel().deleteFevBlog(blogId, userId);
      boolCta = false;
    }
    return {
      favourite: boolCta,
    };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

const saveUserCategory = async (req: any) => {
  let userId = req.session.id;
  try {
    let categories = req.body.categories;
    if (!categories) return new Error("categories filed required!");
    if (!categories.length)
      return new Error("Please select atleast one category!");
    let userSavedCategories = await new BlogModel().getUserSavedCategory(
      userId
    );
    let arrUserSavedCategories: string[] = [];
    if (userSavedCategories[0]["user_category_id"] != null) {
      arrUserSavedCategories =
        userSavedCategories[0]["user_category_id"].split(",");
    }
    const categoriesToInsert = categories.filter((category: any) => {
      const convertedCategory = String(category);
      return !arrUserSavedCategories.includes(convertedCategory);
    });
    for (const category of categoriesToInsert) {
      const userSavedCategory = {
        user_id: userId,
        category_id: category,
      };
      await new BlogModel().insertCategory(userSavedCategory);
    }
    return {
      message: "Successfully saved user categories!",
    };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const ctaBlogRead = async (req: any) => {
  let blogId = req.query.blog_id;
  console.log("blogId: ", blogId);
  
  let userId = req.session.id;
  let isBlogExist = await new BlogModel().isBlogExist(blogId);
  if (!isBlogExist.length) return new Error("blog id does not exist!");
  try {
    let existingBlogReadStatus = await new BlogModel().existingBlogReadStatus(
      blogId,
      userId
    );
    let boolCta = 1;

    if (existingBlogReadStatus.length == 0) {
      let fav = {
        blog_id: blogId,
        user_id: userId,
      };
      await new BlogModel().saveBlogReadStatus(fav);
    }
    return {
      blog_read_status: boolCta,
    };
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

async function downloadAndResizeImage(
  name: string,
  url: string,
  width: number,
  height: number
): Promise<String> {
  const response = await axios.get(url, { responseType: "arraybuffer" });

  const outputFileName = `/public/blog/resized_${name}`;
  const outputPath = path.join(process.cwd(), outputFileName);

  const resizedImageBuffer = await sharp(response.data)
    .resize(width, height)
    .toBuffer();

  const out = await uploadBuffer(
    `resized_${name}`,
    getMimeTypeFromFileName(name),
    resizedImageBuffer
  );

  fs.writeFileSync(outputPath, resizedImageBuffer);
  return outputPath;
}

function getMimeTypeFromFileName(fileName: string): string | undefined {
  const extension = fileName
    .substring(fileName.lastIndexOf(".") + 1)
    .toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "pdf":
      return "application/pdf";
    // Add more cases for other file types as needed
    default:
      return undefined; // Return undefined if the MIME type is unknown
  }
}

const getBlogsCount = async (query: any) => {
  let total = await new BlogModel().getBlogsCount(query);

  return total.length;
};

const getAllCategories = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isAll: any
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = " order by id DESC ";
    }
    let category = await new BlogModel().getAllCategories(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query,
      isAll
    );

    if (!category.length) {
      return new Error("No data found!");
    } else {
      category = category.map((cat: any) => {
        if (cat.icon?.includes("Images")) {
          cat.icon = config.s3imagebaseurl + cat.icon;
        } else {
          cat.icon = config.wolooBaseUrl + "/blog/" + cat.icon;
        }
        return cat;
      });
      return category;
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const getAllCategoriesCount = async (query: any, isAll: any) => {
  let total = await new BlogModel().getAllCategoriesCount(query, isAll);
  return total[0].count;
};
const getAllSubCategories = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isAll: any,
  id: any
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = " order by bsc.id DESC ";
    }
    let category = await new BlogModel().getAllSubCategories(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query,
      isAll,
      id
    );
    if (!category.length) {
      return new Error("No data found!");
    } else {
      category = category.map((cat: any) => {
        if (cat.icon?.includes("Images")) {
          cat.icon = config.s3imagebaseurl + cat.icon;
        } else {
          cat.icon = config.wolooBaseUrl + "/blog/" + cat.icon;
        }
        return cat;
      });
      return category;
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};
const getAllSubCategoriesCount = async (query: any, isAll: any) => {
  let total = await new BlogModel().getAllSubCategoriesCount(query, isAll);
  return total[0].count;
};

export default {
  getBlogsForUserByCategory,
  getUserSavedCategories,
  blogReadPoint,
  getBlogs,
  getBlogsbyID,
  getCategories,
  ecomCoinTotal,
  ecomCoinUpdate,
  ecomTransactionFail,
  ctaLikes,
  getBlogsCount,
  getAllCategories,
  getAllCategoriesCount,
  getAllSubCategories,
  getAllSubCategoriesCount,
  ctaFavourite,
  ctaBlogRead,
  saveUserCategory,
  getCategoriesbyId,
  insertBlogCategory,
  deleteBlogCategorybyId,
  updateBlogCategory,
  getSubCategoriesbyId,
  insert_blog_Subcategory,
  deleteBlogSubCategorybyId,
  updateBlogSubCategory,
  update_Blog,
  deleteBlogbyId,
  getBlogs_byId,
  create_Blog,
};
