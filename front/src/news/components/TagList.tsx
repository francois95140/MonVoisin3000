import React from 'react';

interface ArticleTag {
  label: string;
  color: string;
}

interface TagListProps {
  tags: ArticleTag[];
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tag, index) => (
        <span key={index} className={`category-tag ${tag.color}`}>
          {tag.label}
        </span>
      ))}
    </div>
  );
};

export default TagList;