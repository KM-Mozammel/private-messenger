using System;
using System.Collections.Generic;
using System.Text;

namespace PrivateMessenger.Domain.Interfaces
{
    public interface IRepository<T>
    {
        T GetById(Guid id);
        IEnumerable<T> GetAll();
        void Add(T entity);
        void Update(T entity);
        void Delete(Guid id);
    }
}
