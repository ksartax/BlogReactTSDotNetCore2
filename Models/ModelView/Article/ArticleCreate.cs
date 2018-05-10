﻿using Models.ModelView.Image;
using System.Collections.Generic;

namespace Models.ModelView.Article
{
    public class ArticleCreate
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }

        public virtual ICollection<int> Categories { get; set; }
        public virtual ICollection<ImageCreate> Images { get; set; }
    }
}
