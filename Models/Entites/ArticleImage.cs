﻿using System.ComponentModel.DataAnnotations.Schema;

namespace Models.Entites
{
    public class ArticleImage
    {
        public int ArticleId { get; set; }
        public Article Article { get; set; }

        public int ImageId { get; set; }
        public Image Image { get; set; }
    }
}