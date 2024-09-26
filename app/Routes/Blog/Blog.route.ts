import BlogController from "../../Controllers/Blog.controller";
import express from "express";
import BlogSchema from "../../Constants/Schema/Blog.schema";
const router = express.Router();
import { celebrate } from "celebrate";

router.post(
  "/getBlogsForUserByCategory",
  BlogController.getBlogsForUserByCategory
);

router.post("/getUserSavedCategories", BlogController.getUserSavedCategories);
router.get("/blogReadPoint", BlogController.blogReadPoint);

router.post("/getBlogs",
  celebrate(BlogSchema.fetchAllBlogs),
  BlogController.getBlogs);

router.post("/getBlogDetail", BlogController.getBlogsbyID);
router.get("/getCategories",
  BlogController.getCategories);

router.get("/getCategoriesbyId",
  BlogController.getCategoriesbyId);
router.post("/insertBlogCategory",
  BlogController.insert_blog_category);
router.put("/deleteBlogCategory",
  BlogController.deleteBlogCategorybyId);
router.put("/updateBlogCategory",
  BlogController.updateBlogCategory);

router.get("/getSubCategoriesbyId",
  BlogController.getSubCategoriesbyId);
router.post("/insert_blog_Subcategory",
  BlogController.insert_blog_Subcategory);
router.put("/deleteBlogSubCategory",
  BlogController.deleteBlogSubCategorybyId);
router.put("/updateBlogSubCategory",
  BlogController.updateBlogSubCategory);
router.put("/update_Blog",
  BlogController.update_Blog);
router.post("/create_Blog",
  BlogController.create_Blog);
router.put("/deleteBlog",
  BlogController.deleteBlogbyId);
router.get("/getBlogs_byId",
  BlogController.getBlogs_byId);

router.get("/ctaLikes", BlogController.ctaLikes);
router.get("/ecomCoinTotal", BlogController.ecomCoinTotal);

router.post("/ecomCoinUpdate",
BlogController.ecomCoinUpdate);

router.get("/ecomTransactionFail",
  BlogController.ecomTransactionFail);
router.post("/getAllCategories", BlogController.getAllCategories);
router.post("/getAllSubCategories", BlogController.getAllSubCategories);
router.get("/ctaFavourite", BlogController.ctaFavourite);
router.get("/ctaBlogRead", BlogController.ctaBlogRead);
router.post("/saveUserCategory", BlogController.saveUserCategory);

export default router;
