import BaseModel from "./BaseModel";

export class BlogModel extends BaseModel {
  constructor() {
    super();
  }

  async getGiftPlan(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(id) as count FROM users u ${query}`,
      []
    );
  }

  async updateCtBlog(blogId: number, userIds: any) {
    return await this._executeQuery(
      `UPDATE blog_likes
      SET user_ids = ?
      WHERE blog_id = ?;
      `,
      [userIds, blogId]
    );
  }
  async deleteFevBlog(blogId: number, userId: number) {
    return await this._executeQuery(
      `DELETE FROM blog_favourites
      WHERE blog_id = ? and user_id=?;
      `,
      [blogId, userId]
    );
  }

  async saveBlog(id: number, blog: any) {
    return await this._executeQuery(`UPDATE blogs SET ?  where id=?`, [
      blog,
      id,
    ]);
  }

  async insertCategory(data: any) {
    return await this._executeQuery(`INSERT INTO user_saved_categories set ?`, [
      data,
    ]);
  }

  async categories(categoryIconLink: any) {
   
    return await this._executeQuery(
      ` select id,category_name,CONCAT('${categoryIconLink}','/',icon) AS 'category_icon_url' from blog_categories where status=1 `,
      []
    );
  }

  async updateBlog() {
    return await this._executeQuery(
      `UPDATE blogs SET short_link = ''
      `,
      []
    );
  }

  async saveFevBlog(data: any) {
    return await this._executeQuery("insert into blog_favourites  set ?", [
      data,
    ]);
  }

  async createBlogLikes(data: any) {
    return await this._executeQuery("insert into blog_likes   set ?", [
      data,
    ]);
  }
  async saveBlogReadStatus(data: any) {
    return await this._executeQuery(`INSERT INTO blog_read_status(blog_id, user_id) VALUES (${data.blog_id},${data.user_id})`, []);
  }
  async subCategories(subCategoryIconLink: any) {
    return await this._executeQuery(
      ` select id,sub_category,CONCAT('${subCategoryIconLink}','/',icon) AS 'sub_category_icon_url' from blog_sub_categories where status=1 `,
      []
    );
  }

  async concatCategories(userId: any) {
    return await this._executeQuery(
      `select GROUP_CONCAT(category_id) AS 'user_category_id' from user_saved_categories where user_id = ?;`,
      [userId]
    );
  }

  async userSavedCategoryes(userId: any) { 
    return await this._executeQuery(
      `SELECT
      bc.id,
      bc.category_name ,
      bc.icon as category_icon_url
    FROM
      user_saved_categories AS usc
    JOIN blog_categories AS bc ON
      usc.category_id = bc.id
    WHERE
      usc.user_id = ?`,
      [userId]
    );
  }

  async categoryesInIds(categoryIconLink: any, array: any) {
    
  if(array.length){
    return await this._executeQuery(
      `SELECT id, sub_category, CONCAT('${categoryIconLink}', '/', icon) AS sub_category_icon_url
      FROM blog_sub_categories
      WHERE status = 1
      AND category_id IN (?)`,
      [array]
    );
  } else {
    return await this._executeQuery(
      `SELECT id, sub_category, CONCAT('${categoryIconLink}', '/', icon) AS sub_category_icon_url
      FROM blog_sub_categories
      WHERE status = 1`,
      []
    );
  }
  }

  async getGiftSubscriptionId() {
    return await this._executeQuery(
      `SELECT COUNT(id) as count FROM users u `,
      []
    );
  }

  async getResizeImageBlogs() {
    return await this._executeQuery(
      `SELECT * FROM blogs;
      `,
      []
    );
  }

  async existingBlogUserFav(blogId: number, userId: number) {
    return await this._executeQuery(
      `SELECT *
      FROM blog_favourites
      WHERE blog_id = ? AND user_id = ?
      `,
      [blogId, userId]
    );
  }

  async getUserSavedCategory(userId: number) {

    return await this._executeQuery(
      `SELECT GROUP_CONCAT(category_id) AS user_category_id
      FROM user_saved_categories
      WHERE user_id = ?;`,
      [userId]
    );
  }

  async existingBlogReadStatus(blogId: number, userId: number) {
    return await this._executeQuery(
      `SELECT *
      FROM blog_read_status
      WHERE blog_id = ? AND user_id = ?
      `,
      [blogId, userId]
    );
  }

  async selectBlogs(userId: any, limit: any, offset: any, cat: string) {   
     if(cat){
      return await this._executeQuery(
        `SELECT
        id,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
        author_id,
        short_link,
        CONCAT('resized_', main_image) AS 'main_image',
        title,
        (
            SELECT GROUP_CONCAT(DISTINCT category_name) AS categories
            FROM blog_categories
            WHERE FIND_IN_SET(id, blogs.blog_category)
        ) AS 'categories',
        (
            SELECT GROUP_CONCAT(DISTINCT sub_category) AS sub_categories
            FROM blog_sub_categories
            WHERE FIND_IN_SET(id, blogs.blog_sub_category)
        ) AS 'sub_categories',
        COALESCE(
            (
                SELECT (LENGTH(user_ids) - LENGTH(REPLACE(user_ids, ',', '')) + 1) AS like_counts
                FROM blog_likes
                WHERE blog_id = blogs.id
            ), 0
        ) AS 'like_counts',
        (
            SELECT COUNT(blog_id)
            FROM blog_favourites
            WHERE blog_id = blogs.id
        ) AS 'favourite_counts',
        (
            SELECT EXISTS(
                SELECT 1
                FROM blog_likes
                WHERE blog_id = blogs.id AND FIND_IN_SET('${userId}', user_ids) > 0
            )
        ) AS 'is_liked',
        (
            SELECT EXISTS(
                SELECT 1
                FROM blog_favourites
                WHERE blog_id = blogs.id AND user_id = '${userId}'
            )
        ) AS 'is_favourite',
        (
            SELECT EXISTS(
                SELECT 1
                FROM blog_read_status
                WHERE blog_id = blogs.id AND user_id = '${userId}'
            )
        ) AS 'is_blog_read'
    FROM blogs
    WHERE status = 1
      AND FIND_IN_SET(${cat}, blog_category)
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
    `,
        []
      );
     } else{
      return await this._executeQuery(
        `SELECT
        id,
        status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
        author_id,
        short_link,
        CONCAT('resized_', main_image) AS 'main_image',
        title,
        (
            SELECT GROUP_CONCAT(DISTINCT category_name) AS categories
            FROM blog_categories
            WHERE FIND_IN_SET(id, blogs.blog_category)
        ) AS 'categories',
        (
            SELECT GROUP_CONCAT(DISTINCT sub_category) AS sub_categories
            FROM blog_sub_categories
            WHERE FIND_IN_SET(id, blogs.blog_sub_category)
        ) AS 'sub_categories',
        COALESCE(
            (
                SELECT (LENGTH(user_ids) - LENGTH(REPLACE(user_ids, ',', '')) + 1) AS like_counts
                FROM blog_likes
                WHERE blog_id = blogs.id
            ), 0
        ) AS 'like_counts',
        (
            SELECT COUNT(blog_id)
            FROM blog_favourites
            WHERE blog_id = blogs.id
        ) AS 'favourite_counts',
        (
            SELECT EXISTS(
                SELECT 1
                FROM blog_likes
                WHERE blog_id = blogs.id AND FIND_IN_SET('${userId}', user_ids) > 0
            )
        ) AS 'is_liked',
        (
            SELECT EXISTS(
                SELECT 1
                FROM blog_favourites
                WHERE blog_id = blogs.id AND user_id = '${userId}'
            )
        ) AS 'is_favourite',
        (
            SELECT EXISTS(
                SELECT 1
                FROM blog_read_status
                WHERE blog_id = blogs.id AND user_id = '${userId}'
            )
        ) AS 'is_blog_read'
    FROM blogs
    WHERE status = 1
      
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset};
    `,
        []
      );
     }

  }

  async selectBlogsNonSelectedCategory(userId: any, limit: any, offset: any) {

    return await this._executeQuery(
      `select
      id,
      status,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
      author_id,
      short_link,
      CONCAT('resized_', main_image) AS 'main_image'
          ,
      title,
      (
      SELECT
        GROUP_CONCAT(DISTINCT(category_name)) AS categories
      FROM
        blog_categories
      WHERE
        find_in_set(id, blog_category)) AS 'categories',
      (
      SELECT
        GROUP_CONCAT(DISTINCT(sub_category)) AS sub_categories
      FROM
        blog_sub_categories
      WHERE
        find_in_set(id, blog_sub_category)) AS 'sub_categories',
      (
      SELECT
        COALESCE((
    SELECT (LENGTH(user_ids) - LENGTH(REPLACE(user_ids, ',', '')) + 1) AS like_counts FROM blog_likes WHERE blog_id = blogs.id
    ), 0) AS 'like_counts') AS 'like_counts',
      (
      SELECT
        COUNT(blog_id)
      FROM
        blog_favourites
      WHERE
        blog_id = blogs.id) AS 'favourite_counts',
      (
      SELECT
        EXISTS(
        SELECT
          1
        FROM
          blog_likes
        WHERE
          blog_id = blogs.id
          AND FIND_IN_SET(${userId}, user_ids)>0) ) AS 'is_liked',
      (
      SELECT
        EXISTS(
        SELECT
          1
        FROM
          blog_favourites
        WHERE
          blog_id = blogs.id
          AND user_id = ${userId})) AS 'is_favourite',
      (
      SELECT
        EXISTS(
        SELECT
          1
        FROM
          blog_read_status
        WHERE
          blog_id = blogs.id
          AND user_id = ${userId})) AS 'is_blog_read'
    from
      blogs
    where
      status = 1
    order by
      created_at DESC
    limit ${limit} offset ${offset}`,
      []
    );
  }

  async thirdBigSelectQuery(userId: any, limit: any, offset: any, query: any) {
    const additionalCondition = query ? ` AND ${query}` : '';
    return await this._executeQuery(
      `select
      id,
      status,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
      DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at,
      author_id,
      short_link,
      CONCAT('resized_', main_image) AS 'main_image'
          ,
      title,
      (
      SELECT
        GROUP_CONCAT(DISTINCT(category_name)) AS categories
      FROM
        blog_categories
      WHERE
        find_in_set(id, blog_category)) AS 'categories',
      (
      SELECT
        GROUP_CONCAT(DISTINCT(sub_category)) AS sub_categories
      FROM
        blog_sub_categories
      WHERE
        find_in_set(id, blog_sub_category)) AS 'sub_categories',
      (
      SELECT
        COALESCE((
    SELECT (LENGTH(user_ids) - LENGTH(REPLACE(user_ids, ',', '')) + 1) AS like_counts FROM blog_likes WHERE blog_id = blogs.id
    ), 0) AS 'like_counts') AS 'like_counts',
      (
      SELECT
        COUNT(blog_id)
      FROM
        blog_favourites
      WHERE
        blog_id = blogs.id) AS 'favourite_counts',
      (
      SELECT
        EXISTS(
        SELECT
          1
        FROM
          blog_likes
        WHERE
          blog_id = blogs.id
          AND FIND_IN_SET(${userId}, user_ids)>0) ) AS 'is_liked',
      (
      SELECT
        EXISTS(
        SELECT
          1
        FROM
          blog_favourites
        WHERE
          blog_id = blogs.id
          AND user_id = ${userId})) AS 'is_favourite',
      (
      SELECT
        EXISTS(
        SELECT
          1
        FROM
          blog_read_status
        WHERE
          blog_id = blogs.id
          AND user_id = ${userId})) AS 'is_blog_read'
    from
      blogs
    where
      status = 1${additionalCondition}
    order by
      created_at DESC
    limit ${limit} offset ${offset}`,
      []
    );
  }

  async getUserSavedCategories(userId: number) {
    return await this._executeQuery(
      `SELECT GROUP_CONCAT(category_id) AS user_saved_categories
      FROM user_saved_categories
      WHERE user_id = ?;
      `,
      [userId]
    );
  }

  async checkBlogPoint(userId: number, blogId: number) {
    return await this._executeQuery(
      `SELECT *
      FROM wallets
      WHERE user_id = ?
        AND type = 'Blog Read Point'
        AND blog_id = ?
      LIMIT 1;
      `,
      [userId, blogId]
    );
  }

  async getBlogsForUserByCategory(userId: number) {
    return await this._executeQuery(
      `INSERT INTO wallets (user_id, blog_id, type, remarks, transaction_type, value)
      VALUES (?, ?, 'Blog Read Point', 'Blog Read Point', 'CR', 10)
      `,
      [userId]
    );
  }

  async getBlogCount(updatedAt: any) {
    let count = await this._executeQuery(
      `SELECT count(id) as count
      FROM blogs
      WHERE updated_at < ?
        `,
      [updatedAt]
    );
     return count[0].count;
  }

  async getBlogShortLinkCount() {
    let count = await this._executeQuery(
      `SELECT COUNT(*) AS count
      FROM blogs
      WHERE short_link = '' OR short_link IS NULL;
      `,
      []
    );

    return count[0].count;
  }

  async getBlogDetails(id: number) {
    return await this._executeQuery(
      `SELECT * FROM blogs WHERE id = ?
    `,
      [id]
    );
  }

  async allBlankShortUrlBlogs() {
    return await this._executeQuery(
      `SELECT *
      FROM blogs
      WHERE short_link = '' OR short_link IS NULL`,
      []
    );
  }

  async addBlogPoint(userId: number, blogId: number) {
    return await this._executeQuery(
      `INSERT INTO wallets (user_id, blog_id, type, remarks, transaction_type, value)
      VALUES (?, ?, 'Blog Read Point', 'Blog Read Point', 'CR', 10)
      `,
      [userId, blogId]
    );
  }

  async getBlogs(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    return await this._executeQuery(
      `select id,status,created_at,updated_at,author_id,main_image,title, 
      (SELECT GROUP_CONCAT(DISTINCT(category_name)) AS categories FROM blog_categories WHERE find_in_set(id,blog_category)) AS 'categories',
      (SELECT GROUP_CONCAT(DISTINCT(sub_category)) AS sub_categories FROM blog_sub_categories WHERE find_in_set(id,blog_sub_category)) AS 'sub_categories',
      (SELECT COALESCE((
SELECT (LENGTH(user_ids) - LENGTH(REPLACE(user_ids, ',', '')) + 1) AS like_counts FROM blog_likes WHERE blog_id=blogs.id
),0) AS 'like_counts') AS 'like_counts',
      (SELECT COUNT(blog_id) FROM blog_favourites WHERE blog_id=blogs.id) AS 'favourite_counts' from blogs  ${query}
      ${sortOrder}   LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }
  async getBlogsCount(query: any) {
    return await this._executeQuery(
      `select id,status,created_at,updated_at,author_id,main_image,title, 
      (SELECT GROUP_CONCAT(DISTINCT(category_name)) AS categories FROM blog_categories WHERE find_in_set(id,blog_category)) AS 'categories',
      (SELECT GROUP_CONCAT(DISTINCT(sub_category)) AS sub_categories FROM blog_sub_categories WHERE find_in_set(id,blog_sub_category)) AS 'sub_categories',
      (SELECT COALESCE((
SELECT (LENGTH(user_ids) - LENGTH(REPLACE(user_ids, ',', '')) + 1) AS like_counts FROM blog_likes WHERE blog_id=blogs.id
),0) AS 'like_counts') AS 'like_counts',
      (SELECT COUNT(blog_id) FROM blog_favourites WHERE blog_id=blogs.id) AS 'favourite_counts' from blogs  ${query}`,
      []
    );
  }

  async getCategories() {
    return await this._executeQuery(
      `select id,category_name,icon as category_icon_url,
      (select count(*) from blogs
      where FIND_IN_SET(blog_categories.id, blog_category) > 0) as 'blog_count' from blog_categories;`,
      []
    );
  }
  async getCategoriesbyId(query:string) {
    return await this._executeQuery(
      `select id,category_name,icon,status
       from blog_categories ${query};`,
      []
    );
  }
  async insert_blog_category(data:any) {
    return await this._executeQuery(
      `INSERT INTO blog_categories SET ?`,
      [data]
    );
  }
  async deleteBlogCategorybyId(id:any) {
    return await this._executeQuery(
      `UPDATE blog_categories SET status=0 WHERE id= ?`,
      [id]
    );
  }
  async updateBlogCategory(data:any,id:any) {
    return await this._executeQuery(
      `UPDATE blog_categories SET ? WHERE id= ?`,
      [data,id]
    );
  }
  async getSubCategoriesbyId(query:string) {
    return await this._executeQuery(
      `select bsc.id,bsc.category_id,bc.category_name,bsc.sub_category,bsc.icon,bsc.status
      from blog_sub_categories as bsc left join blog_categories as bc  on bc.id = bsc.category_id ${query};`,
      []
    );
  }
  async insert_blog_Subcategory(data:any) {
    return await this._executeQuery(
      `INSERT INTO blog_sub_categories SET ?`,
      [data]
    );
  }
  async deleteBlogSubCategorybyId(id:any) {
    return await this._executeQuery(
      `UPDATE blog_sub_categories SET status=0 WHERE id= ?`,
      [id]
    );
  }
  async updateBlogSubCategory(data:any,id:any) {
    return await this._executeQuery(
      `UPDATE blog_sub_categories SET ? WHERE id= ?`,
      [data,id]
    );
  }
  async create_Blog(data:any) {
    return await this._executeQuery(
      `INSERT INTO blogs SET ?`,
      [data]
    );
  }
  async update_Blog(data:any,id:any) {
    return await this._executeQuery(
      `UPDATE blogs SET ? WHERE id= ?`,
      [data,id]
    );
  }
  async getBlogCategoryNamebyId(id:string) {
    return await this._executeQuery(
      `SELECT blogs.id,blogs.blog_category,blog_categories.category_name
      FROM blogs 
      INNER JOIN blog_categories ON FIND_IN_SET(blog_categories.id, blogs.blog_category) > 0 where blogs.id=${id} ;`,
      []
    );
  }
  async getBlogSubCategoryNamebyId(id:string) {
    return await this._executeQuery(
      `SELECT blogs.id,blogs.blog_sub_category,blog_sub_categories.sub_category
      FROM blogs 
      INNER JOIN blog_sub_categories ON FIND_IN_SET(blog_sub_categories.id, blogs.blog_sub_category) > 0 where blogs.id=${id} ;`,
      []
    );
  }
  async deleteBlogbyId(id:any) {
    return await this._executeQuery(
      `UPDATE blogs SET status=0 WHERE id= ?`,
      [id]
    );
  }
  async getBlogsbyID(blog_id: number) {
    return await this._executeQuery(`select * from blogs where id=?`, [
      blog_id,
    ]);
  }

  async blogReadPoint(userId: number) {
    return await this._executeQuery(
      `INSERT INTO wallets (user_id, blog_id, type, remarks, transaction_type, value)
      VALUES (?, ?, 'Blog Read Point', 'Blog Read Point', 'CR', 10)
      `,
      [userId]
    );
  }
  async getBlogLike(blog_id: number) {
    return await this._executeQuery(
      `SELECT user_ids FROM blog_likes WHERE blog_id = ?`,
      [blog_id]
    );
  }


  async isBlogExist(blog_id: number) {
    return await this._executeQuery(
      `SELECT id FROM blogs WHERE id = ?`,
      [blog_id]
    );
  }
  async getAllCategories(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string,
    isAll:any
  ) {
    let finalQuery=isAll?"where status=1":`${query} ${sortOrder} LIMIT ${pageSize} OFFSET ${pageIndex}`
    return await this._executeQuery(
      `SELECT * FROM blog_categories ${finalQuery}`,
      []
    );
  }
  async getAllCategoriesCount(query: string, isAll:any) {
    let finalQuery=isAll?"where status=1":`${query} `
    return await this._executeQuery(
      `SELECT count(*) as count FROM blog_categories ${finalQuery}`,
      []
    );
  }
  async getAllSubCategories(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string,
    isAll:any,
    id:any
  ) {
    let finalQuery=isAll?`where bsc.status=1 and bc.id in (${id})`:`${query} ${sortOrder} LIMIT ${pageSize} OFFSET ${pageIndex}`
    return await this._executeQuery(
      `SELECT bsc.id,bc.category_name,bsc.sub_category,bsc.icon,bsc.status,bsc.created_at FROM blog_sub_categories as bsc left join blog_categories as bc on bsc.category_id=bc.id ${finalQuery}`,
      []
    );
  }
  async getAllSubCategoriesCount
    (query: string,isAll:any) {
      let finalQuery=isAll?"where bsc.status=1":`${query} `
    return await this._executeQuery(
      `SELECT count(bsc.id) as count FROM blog_sub_categories as bsc left join blog_categories as bc on bsc.category_id=bc.id ${finalQuery}`,
      []
    );
  }
}
